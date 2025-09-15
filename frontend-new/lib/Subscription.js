import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true
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
    id: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
    },
    confirmationDate: {
      type: Date,
      required: true
    },
    renewalDate: {
      type: Date,
      required: true
    },
    installmentType: {
      type: String,
      enum: ['full', 'partial'],
      required: true
    }
  }]
}, {
  timestamps: true
});

// Create indexes for better performance
subscriptionSchema.index({ studentEmail: 1 });
subscriptionSchema.index({ studentId: 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Subscription) {
  delete mongoose.models.Subscription;
}

export default mongoose.model('Subscription', subscriptionSchema);