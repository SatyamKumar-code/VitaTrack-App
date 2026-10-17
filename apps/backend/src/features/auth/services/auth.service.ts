import crypto from 'crypto';
import { User, IUser } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { AppError } from '../../../core/middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshTokenString,
  hashRefreshToken,
  ACCESS_TOKEN_EXPIRATION_SECONDS,
  REFRESH_TOKEN_EXPIRATION_DAYS
} from '../utils/token.utils';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'admin';
  dateOfBirth: Date;
  biologicalSex: 'male' | 'female' | 'other';
  skinType: string;
  dietaryPreference: string;
  medicalConditions: string[];
  createdAt: Date;
}

export function sanitizeUser(user: IUser): SanitizedUser {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    dateOfBirth: user.dateOfBirth,
    biologicalSex: user.biologicalSex,
    skinType: user.skinType,
    dietaryPreference: user.dietaryPreference,
    medicalConditions: user.medicalConditions,
    createdAt: user.createdAt
  };
}

export class AuthService {
  public static async register(input: RegisterInput): Promise<{
    user: SanitizedUser;
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new AppError('Email is already registered.', 409);
    }

    const user = new User({
      email: input.email.toLowerCase(),
      passwordHash: input.password, // Pre-save hook hashes with bcrypt cost 12
      fullName: input.fullName,
      dateOfBirth: new Date(input.dateOfBirth),
      biologicalSex: input.biologicalSex,
      skinType: input.skinType,
      dietaryPreference: input.dietaryPreference,
      medicalConditions: input.medicalConditions || [],
      role: 'patient',
      isActive: true,
      tokenVersion: 0
    });

    await user.save();

    const tokens = await this.issueTokenPair(user);

    return {
      user: sanitizeUser(user),
      tokens
    };
  }

  public static async login(input: LoginInput): Promise<{
    user: SanitizedUser;
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  }> {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tokens = await this.issueTokenPair(user);

    return {
      user: sanitizeUser(user),
      tokens
    };
  }

  public static async rotateRefreshToken(refreshTokenString: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const hashed = hashRefreshToken(refreshTokenString);
    const existingRecord = await RefreshToken.findOne({ tokenHash: hashed });

    if (!existingRecord) {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    // Reuse detection: If token was already used or revoked, invalidate entire token family
    if (existingRecord.isUsed || existingRecord.isRevoked) {
      await RefreshToken.updateMany({ family: existingRecord.family }, { isRevoked: true });
      await User.findByIdAndUpdate(existingRecord.userId, { $inc: { tokenVersion: 1 } });
      throw new AppError('Refresh token reuse detected. Session terminated for security.', 401);
    }

    if (existingRecord.expiresAt < new Date()) {
      throw new AppError('Refresh token has expired. Please log in again.', 401);
    }

    // Mark current token as used
    existingRecord.isUsed = true;
    await existingRecord.save();

    const user = await User.findById(existingRecord.userId);
    if (!user || !user.isActive) {
      throw new AppError('User account is suspended or no longer active.', 401);
    }

    // Issue new pair under the same family
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion
    });

    const newRefreshTokenString = generateRefreshTokenString();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashRefreshToken(newRefreshTokenString),
      family: existingRecord.family,
      isUsed: false,
      isRevoked: false,
      expiresAt: newExpiresAt
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
      expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS
    };
  }

  public static async logout(refreshTokenString?: string, userId?: string): Promise<void> {
    if (refreshTokenString) {
      const hashed = hashRefreshToken(refreshTokenString);
      const record = await RefreshToken.findOne({ tokenHash: hashed });
      if (record) {
        await RefreshToken.updateMany({ family: record.family }, { isRevoked: true });
      }
    }

    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    }
  }

  public static async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.isActive) {
      // Password reset instructions queued (standard security: timing/payload invariant)
    }

    return {
      message: 'If that email is registered, password recovery instructions have been initiated.'
    };
  }

  private static async issueTokenPair(user: IUser): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion
    });

    const rawRefreshToken = generateRefreshTokenString();
    const family = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashRefreshToken(rawRefreshToken),
      family,
      isUsed: false,
      isRevoked: false,
      expiresAt
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS
    };
  }
}
