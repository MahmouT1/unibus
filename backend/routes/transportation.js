// routes/transportation.js
const express = require('express');
const Transportation = require('../models/Transportation');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get transportation schedule and stations
router.get('/schedule', async (req, res) => {
    try {
        const transportationData = await Transportation.findOne()
            .sort({ createdAt: -1 }); // Get the latest transportation config

        if (!transportationData) {
            // Return default data if none exists
            const defaultData = {
                routeName: 'University Main Route',
                stations: [
                    {
                        name: 'Central Station',
                        location: 'Downtown Area',
                        coordinates: '30.0444,31.2357',
                        parking: 'Main Parking Lot A',
                        capacity: 150,
                        status: 'active'
                    },
                    {
                        name: 'University Station',
                        location: 'Campus Entrance',
                        coordinates: '30.0569,31.2289',
                        parking: 'Student Parking Zone B',
                        capacity: 200,
                        status: 'active'
                    },
                    {
                        name: 'Metro Station',
                        location: 'Subway Connection',
                        coordinates: '30.0528,31.2337',
                        parking: 'Underground Parking C',
                        capacity: 100,
                        status: 'active'
                    },
                    {
                        name: 'Bus Terminal',
                        location: 'Highway Junction',
                        coordinates: '30.0489,31.2398',
                        parking: 'Surface Parking D',
                        capacity: 180,
                        status: 'active'
                    }
                ],
                schedule: {
                    firstAppointment: {
                        time: '08:00 AM',
                        capacity: 0
                    },
                    secondAppointment: {
                        time: '02:00 PM',
                        capacity: 0
                    }
                }
            };

            return res.json({
                success: true,
                transportation: defaultData
            });
        }

        res.json({
            success: true,
            transportation: transportationData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get transportation schedule',
            error: error.message
        });
    }
});

// Update transportation schedule (Admin/Supervisor only)
router.put('/schedule', [
    authMiddleware,
    body('schedule.firstAppointment.capacity').isNumeric(),
    body('schedule.secondAppointment.capacity').isNumeric()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admins and supervisors only.'
            });
        }

        const updateData = req.body;

        let transportation = await Transportation.findOne().sort({ createdAt: -1 });

        if (!transportation) {
            transportation = new Transportation(updateData);
        } else {
            Object.assign(transportation, updateData);
        }

        await transportation.save();

        res.json({
            success: true,
            message: 'Transportation schedule updated successfully',
            transportation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update transportation schedule',
            error: error.message
        });
    }
});

// Set return schedule (Supervisor only)
router.post('/return-schedule', [
    authMiddleware,
    body('returnDate').isISO8601(),
    body('firstAppointmentCount').isNumeric(),
    body('secondAppointmentCount').isNumeric()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        if (req.user.role !== 'supervisor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Supervisors and admins only.'
            });
        }

        const { returnDate, firstAppointmentCount, secondAppointmentCount } = req.body;

        let transportation = await Transportation.findOne().sort({ createdAt: -1 });

        if (!transportation) {
            transportation = new Transportation({
                routeName: 'University Main Route',
                stations: []
            });
        }

        transportation.returnSchedule = {
            returnDate: new Date(returnDate),
            appointments: [
                {
                    time: '2:50 PM',
                    count: firstAppointmentCount,
                    status: firstAppointmentCount > 0 ? 'active' : 'inactive'
                },
                {
                    time: '4:00 PM',
                    count: secondAppointmentCount,
                    status: secondAppointmentCount > 0 ? 'active' : 'inactive'
                }
            ]
        };

        await transportation.save();

        res.json({
            success: true,
            message: 'Return schedule set successfully',
            returnSchedule: transportation.returnSchedule
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to set return schedule',
            error: error.message
        });
    }
});

module.exports = router;
