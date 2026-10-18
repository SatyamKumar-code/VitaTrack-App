import { User } from '../../auth/models/user.model';
import { logger } from '../../../core/logger/logger';

export async function ensureDefaultAdminExists(): Promise<void> {
  try {
    const existing = await User.findOne({ email: 'sysadmin@vitatrack.com' });
    if (!existing) {
      const admin = new User({
        email: 'sysadmin@vitatrack.com',
        passwordHash: 'SuperSecretAdmin123!',
        fullName: 'System Administrator',
        dateOfBirth: new Date('1985-05-15'),
        biologicalSex: 'other',
        role: 'admin',
        isActive: true,
        tokenVersion: 0
      });
      await admin.save();
      logger.info('Default administrator account created: sysadmin@vitatrack.com');
    }
  } catch (error) {
    logger.warn('Could not auto-seed default admin (database may be connecting or read-only):', error);
  }
}
