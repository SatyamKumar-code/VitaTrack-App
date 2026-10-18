import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  timestamp: Date;
}

const adminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    ipAddress: {
      type: String,
      required: true,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      required: true
    },
    details: {
      type: String,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

adminAuditLogSchema.index({ timestamp: -1 });

export const AdminAuditLog: Model<IAdminAuditLog> =
  mongoose.models.AdminAuditLog || mongoose.model<IAdminAuditLog>('AdminAuditLog', adminAuditLogSchema);
