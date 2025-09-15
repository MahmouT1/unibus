// scripts / seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Transportation = require('../models/Transportation');
require('dotenv').config();

async function seedData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Student.deleteMany({});
        await Transportation.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        const adminUser = new User({
            email: 'admin@university.edu',
            password: 'admin123456',
            role: 'admin'
        });
        await adminUser.save();
        console.log('Admin user created: admin@university.edu / admin123456');

        // Create supervisor user
        const supervisorUser = new User({
            email: 'supervisor@university.edu',
            password: 'supervisor123456',
            role: 'supervisor'
        });
        await supervisorUser.save();
        console.log('Supervisor user created: supervisor@university.edu / supervisor123456');

        // Create sample students
        const sampleStudents = [
            {
                email: 'ahmed.hassan@student.edu',
                fullName: 'Ahmed Hassan',
                studentId: 'ST2024001',
                college: 'Engineering',
                grade: 'third-year',
                major: 'Computer Science'
            },
            {
                email: 'sarah.johnson@student.edu',
                fullName: 'Sarah Johnson',
                studentId: 'ST2024002',
                college: 'Medicine',
                grade: 'fourth-year',
                major: 'Medicine'
            },
            {
                email: 'mohammed.ali@student.edu',
                fullName: 'Mohammed Ali',
                studentId: 'ST2024003',
                college: 'Business',
                grade: 'second-year',
                major: 'Business Administration'
            }
        ];

        for (const studentData of sampleStudents) {
            // Create user account
            const user = new User({
                email: studentData.email,
                password: 'student123456',
                role: 'student'
            });
            await user.save();

            // Create student profile
            const student = new Student({
                userId: user._id,
                studentId: studentData.studentId,
                fullName: studentData.fullName,
                phoneNumber: '+20123456789',
                college: studentData.college,
                grade: studentData.grade,
                major: studentData.major,
                academicYear: '2024-2025',
                address: {
                    streetAddress: '123 Main Street',
                    fullAddress: 'Cairo, Egypt'
                }
            });
            await student.save();

            console.log(`Student created: ${studentData.email} / student123456`);
        }

        // Create transportation data
        const transportationData = new Transportation({
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
                    capacity: 150
                },
                secondAppointment: {
                    time: '02:00 PM',
                    capacity: 120
                }
            }
        });
        await transportationData.save();
        console.log('Transportation data created');

        console.log('\nSeed data created successfully!');
        console.log('\nDefault accounts:');
        console.log('Admin: admin@university.edu / admin123456');
        console.log('Supervisor: supervisor@university.edu / supervisor123456');
        console.log('Students: *.student.edu / student123456');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
}

if (require.main === module) {
    seedData();
}

module.exports = seedData;
