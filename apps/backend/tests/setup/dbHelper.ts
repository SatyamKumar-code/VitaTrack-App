import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, IUser } from '../../src/features/auth/models/user.model';
import { RefreshToken, IRefreshToken } from '../../src/features/auth/models/refreshToken.model';
import { Assessment } from '../../src/features/assessment/models/assessment.model';
import { Recommendation } from '../../src/features/guidance/models/recommendation.model';

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

  jest.spyOn(Assessment, 'findOne').mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    const matches = mockAssessments
      .filter((a) => !userIdStr || a.userId?.toString() === userIdStr)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    const result = matches[0] || null;

    return {
      sort: () => Promise.resolve(result),
      then: (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
    } as any;
  });

  jest.spyOn(Assessment, 'countDocuments').mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    const count = mockAssessments.filter(
      (a) => !userIdStr || a.userId?.toString() === userIdStr
    ).length;
    return Promise.resolve(count) as any;
  });

  (jest.spyOn(Assessment, 'find') as any).mockImplementation((filter: any) => {
    const userIdStr = filter?.userId?.toString();
    const getMatches = () => {
      return [...mockAssessments]
        .filter((a) => !userIdStr || a.userId?.toString() === userIdStr)
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    };

    let skipCount = 0;
    let limitCount = 50;

    const queryObj: any = {
      sort: () => queryObj,
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
}

export async function clearTestDb(): Promise<void> {
  mockUsers = [];
  mockRefreshTokens = [];
  mockAssessments = [];
}

export async function closeTestDb(): Promise<void> {
  mockUsers = [];
  mockRefreshTokens = [];
  mockAssessments = [];
  jest.restoreAllMocks();
}
