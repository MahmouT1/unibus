import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'supervisor', 'student'],
    required: true,
    default: 'student'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  permissions: {
    canManageStudents: {
      type: Boolean,
      default: false
    },
    canManageAttendance: {
      type: Boolean,
      default: false
    },
    canManageSubscriptions: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: false
    },
    canManageTransportation: {
      type: Boolean,
      default: false
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

// Pre-save middleware to hash password and set permissions
UserSchema.pre('save', async function(next) {
  // Hash password if it's modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set permissions based on role
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = {
          canManageStudents: true,
          canManageAttendance: true,
          canManageSubscriptions: true,
          canViewReports: true,
          canManageTransportation: true
        };
        break;
      case 'supervisor':
        this.permissions = {
          canManageStudents: false,
          canManageAttendance: true,
          canManageSubscriptions: false,
          canViewReports: true,
          canManageTransportation: false
        };
        break;
      case 'student':
        this.permissions = {
          canManageStudents: false,
          canManageAttendance: false,
          canManageSubscriptions: false,
          canViewReports: false,
          canManageTransportation: false
        };
        break;
    }
  }

  this.updatedAt = Date.now();
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update login stats
UserSchema.methods.updateLoginStats = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Static method to find user by email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);