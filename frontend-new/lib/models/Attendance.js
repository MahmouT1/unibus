import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentInfo: {
    studentId: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    college: {
      type: String,
      required: true
    },
    major: {
      type: String,
      required: true
    },
    grade: {
      type: String,
      required: true
    }
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'excused'],
    default: 'present'
  },
  location: {
    type: String,
    default: 'Main Station'
  },
  scanMethod: {
    type: String,
    enum: ['qr-code', 'manual', 'nfc', 'facial-recognition'],
    default: 'qr-code'
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supervisorInfo: {
    email: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    }
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  coordinates: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },
  isValid: {
    type: Boolean,
    default: true
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateCheckInfo: {
    originalAttendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance',
      default: null
    },
    timeDifference: {
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

// Pre-save middleware
AttendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set date to start of day for consistency
  if (this.isNew) {
    const today = new Date();
    this.date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  
  next();
});

// Compound indexes for better query performance
AttendanceSchema.index({ studentId: 1, date: 1 });
AttendanceSchema.index({ date: 1, status: 1 });
AttendanceSchema.index({ supervisorId: 1, date: 1 });
AttendanceSchema.index({ shiftId: 1 });
AttendanceSchema.index({ createdAt: 1 });

// Text index for search functionality
AttendanceSchema.index({ 
  'studentInfo.fullName': 'text', 
  'studentInfo.studentId': 'text',
  'studentInfo.college': 'text' 
});

// Static methods
AttendanceSchema.statics.getTodayAttendance = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).populate('studentId', 'fullName studentId college major grade');
};

AttendanceSchema.statics.getAttendanceByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('studentId', 'fullName studentId college major grade')
    .populate('supervisorId', 'fullName email');
};

AttendanceSchema.statics.getStudentAttendance = function(studentId, startDate, endDate) {
  const query = { studentId };
  
  if (startDate && endDate) {
    query.date = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.find(query)
    .populate('supervisorId', 'fullName email')
    .sort({ date: -1 });
};

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
