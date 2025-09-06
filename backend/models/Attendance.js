// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent'],
        required: true
    },
    checkInTime: {
        type: Date
    },
    appointmentSlot: {
        type: String,
        enum: ['first', 'second'], // 08:00 AM, 02:00 PM
        required: true
    },
    station: {
        name: String,
        location: String,
        coordinates: String
    },
    qrScanned: {
        type: Boolean,
        default: false
    },
    supervisorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Ensure one attendance record per student per day per slot
attendanceSchema.index({ studentId: 1, date: 1, appointmentSlot: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);