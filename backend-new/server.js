// This is a Next.js project - the backend API routes are handled by Next.js
// This file is kept for reference but the actual API routes are in the api/ directory
// and are served by Next.js when running the frontend application.

console.log('📝 Note: This is a Next.js project.');
console.log('📝 API routes are located in the api/ directory and served by Next.js.');
console.log('📝 To run the backend API, use the frontend application with: npm run dev');
console.log('📝 The API will be available at http://localhost:3000/api/*');

// Health check endpoint for standalone backend (if needed)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Backend health check - API routes are served by Next.js'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend health server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 For full API functionality, run the frontend with: cd ../frontend-new && npm run dev`);
});

module.exports = app;