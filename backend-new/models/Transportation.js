// models/Transportation.js
const mongoose = require('mongoose');

const transportationSchema = new mongoose.Schema({
    routeName: {
        type: String,
        required: true
    },
    stations: [{
        name: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        coordinates: {
            type: String,
            required: true
        },
        parking: {
            type: String,
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'maintenance', 'closed'],
            default: 'active'
        }
    }],
    schedule: {
        firstAppointment: {
            time: {
                type: String,
                default: '08:00 AM'
            },
            capacity: {
                type: Number,
                default: 0
            }
        },
        secondAppointment: {
            time: {
                type: String,
                default: '02:00 PM'
            },
            capacity: {
                type: Number,
                default: 0
            }
        }
    },
    returnSchedule: {
        returnDate: Date,
        appointments: [{
            time: String,
            count: Number,
            status: {
                type: String,
                enum: ['active', 'inactive'],
                default: 'inactive'
            }
        }]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transportation', transportationSchema);
