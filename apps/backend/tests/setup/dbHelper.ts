import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, IUser } from '../../src/features/auth/models/user.model';
import { RefreshToken, IRefreshToken } from '../../src/features/auth/models/refreshToken.model';

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
}

export async function clearTestDb(): Promise<void> {
  mockUsers = [];
  mockRefreshTokens = [];
}

export async function closeTestDb(): Promise<void> {
  mockUsers = [];
  mockRefreshTokens = [];
  jest.restoreAllMocks();
}
