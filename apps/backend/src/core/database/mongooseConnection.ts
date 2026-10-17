import mongoose from 'mongoose';
import { logger } from '../logger/logger';

interface ConnectOptions {
  uri: string;
  maxRetries?: number;
  retryIntervalMs?: number;
}

export class DatabaseManager {
  private static isConnected = false;

  public static async connect({
    uri,
    maxRetries = 5,
    retryIntervalMs = 3000
  }: ConnectOptions): Promise<boolean> {
    if (this.isConnected) {
      logger.info('MongoDB is already connected.');
      return true;
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
        logger.info('Successfully connected to MongoDB.');

        mongoose.connection.on('error', (err) => {
          logger.error('MongoDB runtime connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          this.isConnected = false;
          logger.warn('MongoDB connection lost / disconnected.');
        });

        return true;
      } catch (error) {
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

  public static getStatus(): { isConnected: boolean; readyState: number } {
    return {
      isConnected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState
    };
  }
}
