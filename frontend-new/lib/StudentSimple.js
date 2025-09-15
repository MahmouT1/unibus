import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    userId: {
        type: String, // Changed to String for simplicity
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
    streetAddress: {
        type: String
    },
    buildingNumber: {
        type: String
    },
    fullAddress: {
        type: String
    },
    profilePhoto: {
        type: String
    },
    qrCode: {
        type: String
    },
    attendanceStats: {
        total: { type: Number, default: 0 },
        present: { type: Number, default: 0 },
        late: { type: Number, default: 0 },
        absent: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

export default mongoose.model('StudentSimple', studentSchema);
