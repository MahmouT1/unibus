import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['inactive', 'partial', 'active', 'expired'],
    default: 'inactive'
  },
  confirmationDate: {
    type: Date
  },
  renewalDate: {
    type: Date
  },
  lastPaymentDate: {
    type: Date
  },
  payments: [{
    id: String,
    amount: Number,
    paymentMethod: String,
    paymentDate: Date,
    confirmationDate: Date,
    renewalDate: Date,
    installmentType: {
      type: String,
      enum: ['full', 'partial']
    }
  }]
}, {
  timestamps: true
});

// Create index on studentEmail for faster lookups
subscriptionSchema.index({ studentEmail: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
