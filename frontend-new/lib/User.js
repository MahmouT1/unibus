// models/User.js
import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs'; // Temporarily disabled

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'supervisor'],
        default: 'student'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving (disabled for now)
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });

// Compare password method (simplified for now)
userSchema.methods.comparePassword = async function (candidatePassword) {
    return candidatePassword === this.password; // Simple comparison for now
};

export default mongoose.model('User', userSchema);