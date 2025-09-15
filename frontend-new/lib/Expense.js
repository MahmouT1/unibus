import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['fuel', 'maintenance', 'insurance', 'office_supplies', 'utilities', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['operational', 'administrative', 'maintenance', 'other'],
    default: 'operational'
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

// Index for efficient querying by date
expenseSchema.index({ date: -1 });
expenseSchema.index({ type: 1 });
expenseSchema.index({ category: 1 });

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export default Expense;
