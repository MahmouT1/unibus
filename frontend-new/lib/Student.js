import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    default: 'Not assigned'
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
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

// Create indexes for better performance
studentSchema.index({ email: 1 });
studentSchema.index({ studentId: 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

let Student;
try {
  Student = mongoose.model('Student');
} catch (error) {
  Student = mongoose.model('Student', studentSchema);
}

export default Student;