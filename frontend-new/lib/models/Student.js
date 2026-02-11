import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['first-year', 'second-year', 'third-year', 'fourth-year', 'fifth-year']
  },
  address: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  qrCode: {
    type: String,
    default: null
  },
  attendanceStats: {
    daysRegistered: {
      type: Number,
      default: 0
    },
    attendanceRate: {
      type: Number,
      default: 0
    },
    totalAttendance: {
      type: Number,
      default: 0
    },
    remainingDays: {
      type: Number,
      default: 30
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'expired'],
      default: 'pending'
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    type: {
      type: String,
      enum: ['monthly', 'semester', 'annual'],
      default: 'monthly'
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to update the updatedAt field
StudentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
StudentSchema.index({ studentId: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ fullName: 'text', studentId: 'text', college: 'text' });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);