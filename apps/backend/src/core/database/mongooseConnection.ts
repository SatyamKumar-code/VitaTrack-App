import mongoose from 'mongoose';
import dns from 'dns';
import { logger } from '../logger/logger';

interface ConnectOptions {
  uri: string;
  maxRetries?: number;
  retryIntervalMs?: number;
}

export class DatabaseManager {
  private static isConnected = false;
  private static lastError: string | null = null;

  public static async connect({
    uri,
    maxRetries = 5,
    retryIntervalMs = 3000
  }: ConnectOptions): Promise<boolean> {
    if (this.isConnected) {
      logger.info('MongoDB is already connected.');
      return true;
    }

    // Windows DNS SRV fallback for MongoDB Atlas clusters
    if (uri && uri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      } catch {
        // Fallback silently if system restricts DNS overrides
      }
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(`Attempting MongoDB connection (Attempt ${attempt}/${maxRetries})...`);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000
        });

        this.isConnected = true;
        this.lastError = null;
        logger.info('Successfully connected to MongoDB.');

        mongoose.connection.on('error', (err) => {
          this.lastError = err?.message || 'MongoDB runtime connection error';
          logger.error('MongoDB runtime connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          this.isConnected = false;
          this.lastError = 'MongoDB connection lost / socket closed.';
          logger.warn('MongoDB connection lost / disconnected.');
        });

        return true;
      } catch (error) {
        this.lastError = error instanceof Error ? error.message : String(error);
        logger.warn(
          `MongoDB connection attempt ${attempt} failed. Retrying in ${retryIntervalMs}ms...`
        );
        if (attempt >= maxRetries) {
          logger.error('Exhausted all MongoDB connection retries.', error);
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      }
    }

    return false;
  }

  public static async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB.');
    } catch (error) {
      logger.error('Error during MongoDB disconnect:', error);
    }
  }

  public static getStatus(): { isConnected: boolean; readyState: number; lastError: string | null } {
    return {
      isConnected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      lastError: this.lastError
    };
  }

  public static getLastError(): string | null {
    return this.lastError;
  }
}
