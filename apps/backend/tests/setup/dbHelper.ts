import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, IUser } from '../../src/features/auth/models/user.model';
import { RefreshToken, IRefreshToken } from '../../src/features/auth/models/refreshToken.model';
import { Assessment } from '../../src/features/assessment/models/assessment.model';
import { Recommendation } from '../../src/features/guidance/models/recommendation.model';
import { ReminderPreferences } from '../../src/features/reminders/models/reminderPreference.model';
import { WearableMetric } from '../../src/features/wearables/models/wearableMetric.model';

// In-memory collections for fast, deterministic, self-contained testing
interface MockUserData {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  dateOfBirth: Date;
  biologicalSex: 'male' | 'female' | 'other';
  skinType: 'type_1' | 'type_2' | 'type_3' | 'type_4' | 'type_5' | 'type_6';
  dietaryPreference: 'omnivore' | 'pescatarian' | 'vegetarian' | 'vegan';
  medicalConditions: string[];
  role: 'patient' | 'admin';
  isActive: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MockRefreshTokenData {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  family: string;
  isUsed: boolean;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

let mockUsers: MockUserData[] = [];
let mockRefreshTokens: MockRefreshTokenData[] = [];
let mockAssessments: any[] = [];
let mockReminderPreferences: any[] = [];
let mockWearables: any[] = [];

function createMockUserDoc(data: MockUserData): IUser {
  const doc = {
    ...data,
    comparePassword: async (candidate: string) => {
      return bcrypt.compare(candidate, data.passwordHash);
    },
    save: async function () {
      const idx = mockUsers.findIndex((u) => u._id.equals(data._id));
      if (idx >= 0) {
        mockUsers[idx] = { ...data };
      } else {
        // Hash password with bcrypt cost 12 on creation
        const salt = await bcrypt.genSalt(12);
        data.passwordHash = await bcrypt.hash(data.passwordHash, salt);
        mockUsers.push({ ...data });
      }
      return doc as unknown as IUser;
    }
  };
  return doc as unknown as IUser;
}

function createMockRefreshTokenDoc(data: MockRefreshTokenData): IRefreshToken {
  const doc: any = {
    ...data,
    save: async function () {
      data.isUsed = this.isUsed;
      data.isRevoked = this.isRevoked;
      const idx = mockRefreshTokens.findIndex((r) => r._id.equals(data._id));
      if (idx >= 0) {
        mockRefreshTokens[idx] = { ...data };
      } else {
        mockRefreshTokens.push({ ...data });
      }
      return doc as unknown as IRefreshToken;
    }
  };
  return doc as unknown as IRefreshToken;
}

export async function connectTestDb(): Promise<void> {
  // Clear any existing data
  mockUsers = [];
  mockRefreshTokens = [];
  mockAssessments = [];
  mockReminderPreferences = [];

  // Spy & Mock User Model methods
  jest.spyOn(User, 'findOne').mockImplementation((filter: any) => {
    let match: MockUserData | undefined;
    if (filter?.email) {
      match = mockUsers.find((u) => u.email.toLowerCase() === filter.email.toLowerCase());
    }
    return Promise.resolve(match ? createMockUserDoc(match) : null) as any;
  });

  jest.spyOn(User, 'findById').mockImplementation((id: any) => {
    const idStr = id?.toString();
    const match = mockUsers.find((u) => u._id.toString() === idStr);
    return Promise.resolve(match ? createMockUserDoc(match) : null) as any;
  });

  jest.spyOn(User, 'findByIdAndUpdate').mockImplementation((id: any, update: any) => {
    const idStr = id?.toString();
    const match = mockUsers.find((u) => u._id.toString() === idStr);
    if (match) {
      if (update?.$inc?.tokenVersion) {
        match.tokenVersion += update.$inc.tokenVersion;
      }
      return Promise.resolve(createMockUserDoc(match)) as any;
    }
    return Promise.resolve(null) as any;
  });

  // Override User constructor prototype save
  const origSave = User.prototype.save;
  jest.spyOn(User.prototype, 'save').mockImplementation(async function (this: any) {
    const userDoc = this;
    if (!userDoc._id) {
      userDoc._id = new mongoose.Types.ObjectId();
    }
    const rawPassword = userDoc.passwordHash;
    const salt = await bcrypt.genSalt(12);
    userDoc.passwordHash = await bcrypt.hash(rawPassword, salt);
    userDoc.createdAt = userDoc.createdAt || new Date();
    userDoc.updatedAt = new Date();

    const data: MockUserData = {
      _id: userDoc._id,
      email: userDoc.email,
      passwordHash: userDoc.passwordHash,
      fullName: userDoc.fullName,
      dateOfBirth: userDoc.dateOfBirth,
      biologicalSex: userDoc.biologicalSex,
      skinType: userDoc.skinType,
      dietaryPreference: userDoc.dietaryPreference,
      medicalConditions: userDoc.medicalConditions,
      role: userDoc.role,
      isActive: userDoc.isActive,
      tokenVersion: userDoc.tokenVersion,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    };

    const idx = mockUsers.findIndex((u) => u._id.equals(data._id));
    if (idx >= 0) {
      mockUsers[idx] = data;
    } else {
      mockUsers.push(data);
    }
    return userDoc;
  });

  // Spy & Mock RefreshToken methods
  jest.spyOn(RefreshToken, 'create').mockImplementation((data: any) => {
    const record: MockRefreshTokenData = {
      _id: new mongoose.Types.ObjectId(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      family: data.family,
      isUsed: false,
      isRevoked: false,
      expiresAt: data.expiresAt,
      createdAt: new Date()
    };
    mockRefreshTokens.push(record);
    return Promise.resolve(createMockRefreshTokenDoc(record)) as any;
  });

  jest.spyOn(RefreshToken, 'findOne').mockImplementation((filter: any) => {
    let match: MockRefreshTokenData | undefined;
    if (filter?.tokenHash) {
      match = mockRefreshTokens.find((r) => r.tokenHash === filter.tokenHash);
    }
    return Promise.resolve(match ? createMockRefreshTokenDoc(match) : null) as any;
  });

  jest.spyOn(RefreshToken, 'updateMany').mockImplementation((filter: any, update: any) => {
    let count = 0;
    for (const token of mockRefreshTokens) {
      if (filter?.family && token.family === filter.family) {
        if (update?.isRevoked !== undefined) {
          token.isRevoked = update.isRevoked;
        }
        count++;
      }
    }
    return Promise.resolve({ matchedCount: count, modifiedCount: count }) as any;
  });

  // Spy & Mock Assessment Model methods
  jest.spyOn(Assessment, 'create').mockImplementation((data: any) => {
    const doc: any = {
      _id: new mongoose.Types.ObjectId(),
      userId: data.userId,
      completedAt: data.completedAt || new Date(),
      symptoms: data.symptoms,
      sunExposure: data.sunExposure,
      dietaryHabits: data.dietaryHabits,
      scoringResults: data.scoringResults,
      aiExplanation: data.aiExplanation
    };
    mockAssessments.push(doc);
    return Promise.resolve(doc) as any;
  });

  function matchesAssessmentFilter(a: any, filter: any): boolean {
    if (filter?.userId && a.userId?.toString() !== filter.userId?.toString()) {
      return false;
    }
    if (filter?._id && a._id?.toString() !== filter._id?.toString()) {
      return false;
    }
    if (filter?.completedAt) {
      const aTime = new Date(a.completedAt).getTime();
      if (filter.completedAt.$gte && aTime < new Date(filter.completedAt.$gte).getTime()) {
        return false;
      }
      if (filter.completedAt.$lte && aTime > new Date(filter.completedAt.$lte).getTime()) {
        return false;
      }
    }
    return true;
  }

  jest.spyOn(Assessment, 'findOne').mockImplementation((filter: any) => {
    const matches = mockAssessments
      .filter((a) => matchesAssessmentFilter(a, filter))
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    const result = matches[0] || null;

    const queryObj: any = {
      sort: () => queryObj,
      exec: () => Promise.resolve(result),
      then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
    };
    return queryObj as any;
  });

  jest.spyOn(Assessment, 'countDocuments').mockImplementation((filter: any) => {
    const count = mockAssessments.filter((a) => matchesAssessmentFilter(a, filter)).length;
    return Promise.resolve(count) as any;
  });

  (jest.spyOn(Assessment, 'find') as any).mockImplementation((filter: any) => {
    let sortDirection = -1; // default descending

    const getMatches = () => {
      return [...mockAssessments]
        .filter((a) => matchesAssessmentFilter(a, filter))
        .sort((a, b) =>
          sortDirection === 1
            ? a.completedAt.getTime() - b.completedAt.getTime()
            : b.completedAt.getTime() - a.completedAt.getTime()
        );
    };

    let skipCount = 0;
    let limitCount = 50;

    const queryObj: any = {
      sort: (sortSpec: any) => {
        if (sortSpec?.completedAt === 1) {
          sortDirection = 1;
        } else if (sortSpec?.completedAt === -1) {
          sortDirection = -1;
        }
        return queryObj;
      },
      skip: (count: number) => {
        skipCount = count;
        return queryObj;
      },
      limit: (count: number) => {
        limitCount = count;
        return queryObj;
      },
      then: (resolve: any, reject: any) => {
        const matches = getMatches().slice(skipCount, skipCount + limitCount);
        return Promise.resolve(matches).then(resolve, reject);
      }
    };

    return queryObj as any;
  });

  // Spy & Mock Recommendation Model methods
  jest.spyOn(Recommendation, 'create').mockImplementation((data: any) => {
    return Promise.resolve({
      _id: new mongoose.Types.ObjectId(),
      ...data
    }) as any;
  });

  // Spy & Mock ReminderPreferences Model methods
  jest.spyOn(ReminderPreferences, 'findOne').mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    const found = mockReminderPreferences.find((p) => p.userId?.toString() === userIdStr);
    return Promise.resolve(found ? { ...found } : null) as any;
  });

  jest.spyOn(ReminderPreferences, 'create').mockImplementation((data: any) => {
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    mockReminderPreferences.push(doc);
    return Promise.resolve({ ...doc }) as any;
  });

  jest.spyOn(ReminderPreferences, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
    const userIdStr = filter?.userId?.toString();
    let match = mockReminderPreferences.find((p) => p.userId?.toString() === userIdStr);
    const updateData = update?.$set || update || {};
    if (!match) {
      match = {
        _id: new mongoose.Types.ObjectId(),
        userId: filter.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updateData
      };
      mockReminderPreferences.push(match);
    } else {
      Object.assign(match, updateData, { updatedAt: new Date() });
    }
    return Promise.resolve({ ...match }) as any;
  });

  // Spy & Mock WearableMetric Model methods
  jest.spyOn(WearableMetric, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
    const userIdStr = filter?.userId?.toString();
    const metricsDate = filter?.metricsDate;
    let match = mockWearables.find(
      (w) => w.userId?.toString() === userIdStr && w.metricsDate === metricsDate
    );
    const updateData = update?.$set || update || {};
    if (!match) {
      match = {
        _id: new mongoose.Types.ObjectId(),
        userId: filter.userId,
        metricsDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncedAt: new Date(),
        ...updateData
      };
      mockWearables.push(match);
    } else {
      Object.assign(match, updateData, { updatedAt: new Date() });
    }
    return Promise.resolve({ ...match }) as any;
  });

  jest.spyOn(WearableMetric, 'findOne').mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    const metricsDate = filter?.metricsDate;
    const matches = mockWearables
      .filter((w) => {
        if (userIdStr && w.userId?.toString() !== userIdStr) return false;
        if (metricsDate && w.metricsDate !== metricsDate) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.metricsDate !== a.metricsDate) {
          return b.metricsDate.localeCompare(a.metricsDate);
        }
        return new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime();
      });

    const result = matches[0] ? { ...matches[0] } : null;

    const queryObj: any = {
      sort: () => queryObj,
      exec: () => Promise.resolve(result),
      then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
    };
    return queryObj as any;
  });

  (jest.spyOn(WearableMetric, 'find') as any).mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    let limitCount = 50;

    const getMatches = () => {
      return mockWearables
        .filter((w) => {
          if (userIdStr && w.userId?.toString() !== userIdStr) return false;
          return true;
        })
        .sort((a, b) => b.metricsDate.localeCompare(a.metricsDate))
        .map((w) => ({ ...w }));
    };

    const queryObj: any = {
      sort: () => queryObj,
      limit: (count: number) => {
        limitCount = count;
        return queryObj;
      },
      exec: () => Promise.resolve(getMatches().slice(0, limitCount)),
      then: (resolve: any, reject: any) =>
        Promise.resolve(getMatches().slice(0, limitCount)).then(resolve, reject)
    };
    return queryObj as any;
  });

  jest.spyOn(WearableMetric, 'countDocuments').mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    const metricsDate = filter?.metricsDate;
    const count = mockWearables.filter((w) => {
      if (userIdStr && w.userId?.toString() !== userIdStr) return false;
      if (metricsDate && w.metricsDate !== metricsDate) return false;
      return true;
    }).length;
    return Promise.resolve(count) as any;
  });
}

export async function clearTestDb(): Promise<void> {
  mockUsers = [];
  mockRefreshTokens = [];
  mockAssessments = [];
  mockReminderPreferences = [];
  mockWearables = [];
}

export async function closeTestDb(): Promise<void> {
  mockUsers = [];
  mockRefreshTokens = [];
  mockAssessments = [];
  mockReminderPreferences = [];
  mockWearables = [];
  jest.restoreAllMocks();
}
