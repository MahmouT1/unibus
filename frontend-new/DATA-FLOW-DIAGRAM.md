# 🚌 UniBus System - Data Flow Diagram

## 📊 UNIFIED AUTHENTICATION SYSTEM

### 1. SINGLE ENTRY POINT
```
Homepage (/) → "🚀 Enter Portal" → /auth page
```

### 2. UNIFIED AUTH PAGE (/auth)
```
┌─────────────────────────────────────┐
│         🔐 LOGIN | 📝 REGISTER       │
│                                     │
│  Email: ________________           │
│  Password: _____________           │
│  Role: [Student▼] [Admin] [Supervisor] │
│                                     │
│  [🚀 Login] or [📝 Register]        │
└─────────────────────────────────────┘
```

### 3. DATABASE STRUCTURE
```
MongoDB: student-portal
├── users (UNIFIED COLLECTION)
│   ├── admin@unibus.edu (role: admin)
│   ├── supervisor@unibus.edu (role: supervisor)
│   └── student@unibus.edu (role: student)
├── students (preserved)
├── attendance (preserved)
├── subscriptions (preserved)
└── transportation (preserved)
```

### 4. ROLE-BASED ROUTING
```
Login Success → Check Role → Redirect:
├── admin → /admin/dashboard
├── supervisor → /admin/supervisor-dashboard
└── student → /student/portal
```

## ✅ SYSTEM VERIFICATION

### CREATED ACCOUNTS:
- **👨‍💼 Admin:** admin@unibus.edu / admin123
- **👨‍🏫 Supervisor:** supervisor@unibus.edu / supervisor123  
- **🎓 Student:** student@unibus.edu / student123

### PRESERVED FEATURES:
- ✅ Admin dashboard with sidebar
- ✅ Supervisor dashboard with QR scanner
- ✅ Student portal with all functions
- ✅ All original designs intact
- ✅ Database structure maintained

## 🎯 READY FOR TESTING!
