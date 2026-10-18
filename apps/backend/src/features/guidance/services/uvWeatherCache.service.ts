import { RedisManager } from '../../../core/cache/redisClient';
import { logger } from '../../../core/logger/logger';

export interface UvForecastData {
  latitude: number;
  longitude: number;
  uvIndex: number;
  category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  isDaylight: boolean;
  temperatureC?: number;
  advice: string;
  source: 'cache' | 'open-meteo' | 'deterministic-fallback';
  cached: boolean;
  timestamp: string;
  expiresInSeconds?: number;
}

export class UvWeatherCacheService {
  private static readonly TTL_SECONDS = 3600; // 1 hour per spec §6.1

  /**
   * Categorizes numeric UV index according to WHO / EPA ultraviolet guidance
   */
  public static categorizeUvIndex(uv: number): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
    if (uv < 3.0) return 'Low';
    if (uv < 6.0) return 'Moderate';
    if (uv < 8.0) return 'High';
    if (uv < 11.0) return 'Very High';
    return 'Extreme';
  }

  /**
   * Generates clinically sound Vitamin D synthesis advisory based on UV tier
   */
  public static getSynthesisAdvice(category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme'): string {
    switch (category) {
      case 'Low':
        return 'Low solar radiation. 25–35 minutes of direct uncovered exposure on arms and legs recommended to stimulate cutaneous synthesis.';
      case 'Moderate':
        return 'Optimal synthesis waveband (UV 3–6). 15–20 minutes safe uncovered exposure recommended without burning.';
      case 'High':
        return 'Elevated UVB intensity. 10–15 minutes is sufficient for synthesis. Apply broad-spectrum SPF 30+ thereafter if remaining outdoors.';
      case 'Very High':
      case 'Extreme':
        return 'Intense UV radiation hazard. Seek shade between 11 AM and 3 PM. Unprotected exposure may cause erythema in under 10 minutes.';
    }
  }

  /**
   * Retrieves live or cached UV index for coordinates
   */
  public static async getUvForecast(lat: number, lon: number): Promise<UvForecastData> {
    const cacheKey = RedisManager.getUvKey(lat, lon);

    // 1. Check Redis Cache
    try {
      const cached = await RedisManager.get<UvForecastData>(cacheKey);
      if (cached) {
        return {
          ...cached,
          source: 'cache',
          cached: true
        };
      }
    } catch (err: any) {
      logger.warn(`Failed reading UV cache key ${cacheKey}: ${err.message}`);
    }

    // 2. Fetch from Open-Meteo API
    let forecast: UvForecastData;
    try {
      forecast = await this.fetchOpenMeteo(lat, lon);
    } catch (err: any) {
      logger.info(`Open-Meteo external API unreachable (${err.message}). Using deterministic solar calculation.`);
      forecast = this.computeDeterministicFallback(lat, lon);
    }

    // 3. Store in Redis Cache with 1-hour TTL
    try {
      await RedisManager.set(cacheKey, forecast, this.TTL_SECONDS);
    } catch (err: any) {
      logger.warn(`Failed persisting UV forecast to Redis: ${err.message}`);
    }

    return forecast;
  }

  /**
   * Fetches real-time UV and temperature from Open-Meteo free API
   */
  private static async fetchOpenMeteo(lat: number, lon: number): Promise<UvForecastData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index,temperature_2m,is_day&timezone=auto`;

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'VitaTrack-SolarEngine/1.0' }
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo returned status ${response.status}`);
      }

      const json = (await response.json()) as any;
      const current = json?.current;
      const rawUv = typeof current?.uv_index === 'number' ? current.uv_index : 4.5;
      const isDay = current?.is_day === 1;
      const temp = current?.temperature_2m;

      const uvIndex = Math.max(0, Math.round(rawUv * 10) / 10);
      const category = this.categorizeUvIndex(uvIndex);
      const advice = this.getSynthesisAdvice(category);

      return {
        latitude: lat,
        longitude: lon,
        uvIndex,
        category,
        isDaylight: isDay,
        temperatureC: temp,
        advice,
        source: 'open-meteo',
        cached: false,
        timestamp: new Date().toISOString()
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Deterministic solar model based on geographic latitude and solar zenith angle
   * Used for offline/test environments and resilient fallback
   */
  public static computeDeterministicFallback(lat: number, lon: number): UvForecastData {
    const now = new Date();
    const utcHours = now.getUTCHours();
    // Approximate local solar time
    const localHour = (utcHours + Math.round(lon / 15) + 24) % 24;

    const isDaylight = localHour >= 6 && localHour <= 19;
    let uvIndex = 0.0;

    if (isDaylight) {
      // Bell curve peaked at 13:00 local time
      const hourOffset = Math.abs(localHour - 13);
      const latitudeAttenuator = Math.cos((lat * Math.PI) / 180);
      const peakUv = Math.max(2.0, 8.5 * Math.max(0.2, latitudeAttenuator));
      uvIndex = Math.max(0.5, Math.round((peakUv - hourOffset * 1.2) * 10) / 10);
    }

    const category = this.categorizeUvIndex(uvIndex);
    const advice = this.getSynthesisAdvice(category);

    return {
      latitude: lat,
      longitude: lon,
      uvIndex,
      category,
      isDaylight,
      advice,
      source: 'deterministic-fallback',
      cached: false,
      timestamp: now.toISOString()
    };
  }
}
