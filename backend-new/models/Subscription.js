// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    planType: {
        type: String,
        enum: ['Basic', 'Standard', 'Premium'],
        default: 'Standard'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'EGP'
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Expired', 'Cancelled'],
        default: 'Pending'
    },
    confirmationDate: {
        type: Date
    },
    renewalDate: {
        type: Date
    },
    autoRenewal: {
        type: Boolean,
        default: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'credit_card', 'debit_card'],
        default: 'cash'
    },
    paymentHistory: [{
        amount: Number,
        paymentDate: Date,
        method: String,
        status: {
            type: String,
            enum: ['completed', 'pending', 'failed'],
            default: 'pending'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
