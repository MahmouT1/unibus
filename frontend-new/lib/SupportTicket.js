// models/SupportTicket.js
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['emergency', 'general', 'academic', 'technical', 'billing'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments: [{
        filename: String,
        url: String,
        uploadDate: Date
    }],
    responses: [{
        responderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        responseDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);