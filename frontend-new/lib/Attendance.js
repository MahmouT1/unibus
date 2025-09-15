// models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    studentPhone: {
        type: String
    },
    studentCollege: {
        type: String
    },
    studentGrade: {
        type: String
    },
    studentMajor: {
        type: String
    },
    studentAddress: {
        type: Object
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent'],
        required: true,
        default: 'Present'
    },
    checkInTime: {
        type: Date,
        default: Date.now
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
        default: true
    },
    supervisorId: {
        type: String // Changed to String to match our current system
    },
    supervisorName: {
        type: String
    },
    notes: {
        type: String
    },
    qrData: {
        type: Object // Store the complete QR data for reference
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure one attendance record per student per day per slot
attendanceSchema.index({ studentId: 1, date: 1, appointmentSlot: 1 }, { unique: true });

// Clear any existing model to avoid conflicts
if (mongoose.models.Attendance) {
  delete mongoose.models.Attendance;
}

let Attendance;
try {
  Attendance = mongoose.model('Attendance');
} catch (error) {
  Attendance = mongoose.model('Attendance', attendanceSchema);
}

export default Attendance;