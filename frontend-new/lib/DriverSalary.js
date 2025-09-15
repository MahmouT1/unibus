import mongoose from 'mongoose';

const driverSalarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  hoursWorked: {
    type: Number,
    min: 0,
    default: 0
  },
  ratePerHour: {
    type: Number,
    min: 0,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check'],
    default: 'bank_transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'paid'
  },
  createdBy: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by date and driver
driverSalarySchema.index({ date: -1 });
driverSalarySchema.index({ driverName: 1 });
driverSalarySchema.index({ status: 1 });

const DriverSalary = mongoose.models.DriverSalary || mongoose.model('DriverSalary', driverSalarySchema);

export default DriverSalary;
