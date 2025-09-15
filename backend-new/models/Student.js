// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        enum: ['first-year', 'preparatory', 'second-year', 'third-year', 'fourth-year', 'fifth-year'],
        required: true
    },
    major: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    address: {
        streetAddress: String,
        buildingNumber: String,
        fullAddress: String
    },
    profilePhoto: {
        type: String // URL to uploaded photo
    },
    qrCode: {
        type: String // Generated QR code data
    },
    attendanceStats: {
        daysRegistered: {
            type: Number,
            default: 0
        },
        remainingDays: {
            type: Number,
            default: 180
        },
        attendanceRate: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Low Days', 'Critical', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);