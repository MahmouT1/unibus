const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const subscriptionRoutes = require('./routes/subscriptions');
const attendanceRoutes = require('./routes/attendance');
const transportationRoutes = require('./routes/transportation');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = 5000;

console.log('Starting server...');

app.use(express.json());

// Add CORS middleware HERE - before routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Content-Disposition'] // Important for downloads
}));

// Serve static files for uploads with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set content type based on file extension
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));

mongoose.connect('mongodb://localhost:27017/student-portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

console.log('About to add health route...');

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running'
    });
});

// Add QR code download endpoint
app.get('/api/download-qr/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, 'uploads', 'qr-codes', filename);
        
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'QR code file not found' 
            });
        }
        
        // Set download headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Send file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Download failed' 
        });
    }
});

console.log('Adding auth route...');
app.use('/api/auth', authRoutes);

console.log('Adding students route...');
app.use('/api/students', studentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/transportation', transportationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler (must be last)
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

console.log('About to start listening...');

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

console.log('Server setup complete');
