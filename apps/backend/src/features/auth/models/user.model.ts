import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
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
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    biologicalSex: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    skinType: {
      type: String,
      enum: ['type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6'],
      default: 'type_3'
    },
    dietaryPreference: {
      type: String,
      enum: ['omnivore', 'pescatarian', 'vegetarian', 'vegan'],
      default: 'omnivore'
    },
    medicalConditions: {
      type: [String],
      default: []
    },
    role: {
      type: String,
      enum: ['patient', 'admin'],
      default: 'patient',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index for role and active status as required by DATABASE_SCHEMA.md
userSchema.index({ role: 1, isActive: 1 });

// Password hashing pre-save hook using bcrypt with cost factor 12
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
