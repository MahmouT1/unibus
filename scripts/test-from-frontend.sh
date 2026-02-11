#!/bin/sh
# Test backend connectivity from frontend container
curl -s -X POST http://127.0.0.1:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sasasona@gmail.com","password":"Sons123","role":"supervisor"}'
