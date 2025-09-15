import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supervisorEmail: {
    type: String,
    required: true
  },
  supervisorName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  shiftStart: {
    type: Date,
    required: true
  },
  shiftEnd: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  attendanceRecords: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    studentEmail: String,
    studentName: String,
    scanTime: {
      type: Date,
      default: Date.now
    },
    location: String,
    notes: String
  }],
  totalScans: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
shiftSchema.index({ supervisorId: 1, date: 1 });
shiftSchema.index({ date: 1, status: 1 });

// Update the updatedAt field before saving
shiftSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Shift = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);

export default Shift;
