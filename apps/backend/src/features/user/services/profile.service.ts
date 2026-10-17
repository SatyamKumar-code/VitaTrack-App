import { User } from '../../auth/models/user.model';
import { AppError } from '../../../core/middleware/errorHandler';
import { UpdateProfileInput } from '../validators/profile.validator';
import { SanitizedUser, sanitizeUser } from '../../auth/services/auth.service';

export class ProfileService {
  public static async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('User profile not found or account is deactivated.', 404);
    }
    return sanitizeUser(user);
  }

  public static async updateProfile(
    userId: string,
    updates: UpdateProfileInput
  ): Promise<SanitizedUser> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('User profile not found or account is deactivated.', 404);
    }

    if (updates.fullName !== undefined) {
      user.fullName = updates.fullName;
    }
    if (updates.dateOfBirth !== undefined) {
      user.dateOfBirth = new Date(updates.dateOfBirth);
    }
    if (updates.biologicalSex !== undefined) {
      user.biologicalSex = updates.biologicalSex;
    }
    if (updates.skinType !== undefined) {
      user.skinType = updates.skinType;
    }
    if (updates.dietaryPreference !== undefined) {
      user.dietaryPreference = updates.dietaryPreference;
    }
    if (updates.medicalConditions !== undefined) {
      user.medicalConditions = updates.medicalConditions;
    }

    await user.save();
    return sanitizeUser(user);
  }
}
