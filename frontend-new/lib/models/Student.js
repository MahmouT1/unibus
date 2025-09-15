import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    default: 'Not assigned',
    unique: false // Allow multiple students with "Not assigned" ID
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phoneNumber: {
    type: String
  },
  college: {
    type: String
  },
  grade: {
    type: String
  },
  major: {
    type: String
  },
  academicYear: {
    type: String,
    default: '2024-2025'
  },
  address: {
    streetAddress: String,
    buildingNumber: String,
    fullAddress: String
  },
  profilePhoto: {
    type: String
  },
  qrCode: {
    type: String
  },
  attendanceStats: {
    daysRegistered: {
      type: Number,
      default: 0
    },
    remainingDays: {
      type: Number,
      default: 180
    },
    attendanceRate: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    default: 'Active'
  }
}, {
  timestamps: true
});

// Create index on email for faster lookups
studentSchema.index({ email: 1 });

export default mongoose.model('Student', studentSchema);
