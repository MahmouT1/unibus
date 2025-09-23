#!/bin/bash

echo "🚀 Starting Full Stack Student Portal System"
echo "============================================"

echo ""
echo "📡 Starting Backend API Server..."
cd backend-new && npm run dev &
BACKEND_PID=$!

sleep 3

echo ""
echo "🎨 Starting Frontend Next.js Server..."
cd ../frontend-new && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo ""
echo "📊 Backend API: http://localhost:3001"
echo "🌍 Frontend App: http://localhost:3000"
echo "📋 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
