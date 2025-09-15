@echo off
echo 🚀 Starting Student Portal Backend Health Check...
cd backend-new
echo 📝 This is a health check server only
echo 🔗 Health Check: http://localhost:3001/health
echo 📝 For full API functionality, use start-frontend.bat
npm start
pause
