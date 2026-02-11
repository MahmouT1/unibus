#!/bin/bash
FILE="/var/www/unitrans/backend-new/server.js"
# Add auth-api route after api/auth line
sed -i "s|app.use('/api/auth', require('./routes/auth'));|app.use('/api/auth', require('./routes/auth'));\napp.use('/auth-api', require('./routes/auth'));|" "$FILE"
