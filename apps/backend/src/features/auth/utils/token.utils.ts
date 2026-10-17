import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../../core/config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  tokenVersion: number;
}

export const ACCESS_TOKEN_EXPIRATION_SECONDS = 900; // 15 minutes (900 seconds)
export const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(32).toString('hex'); // 256-bit cryptographically secure hex
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
