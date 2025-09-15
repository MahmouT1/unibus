import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({}, {
  timestamps: true,
  strict: false // Allow any fields to match existing data
});

// Clear any existing model to avoid conflicts
if (mongoose.models.SubscriptionSimple) {
  delete mongoose.models.SubscriptionSimple;
}

export default mongoose.model('SubscriptionSimple', subscriptionSchema, 'subscriptions');
