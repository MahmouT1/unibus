@echo off
echo 🚀 Starting Full Stack Student Portal System
echo ============================================

echo.
echo 📡 Starting Backend API Server...
start "Backend API" cmd /k "cd /d C:\Student_portal\backend-new && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo 🎨 Starting Frontend Next.js Server...
start "Frontend Next.js" cmd /k "cd /d C:\Student_portal\frontend-new && npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo 📊 Backend API: http://localhost:3001
echo 🌍 Frontend App: http://localhost:3000
echo 📋 Health Check: http://localhost:3001/health
echo.
echo Press any key to close this window...
pause >nul
