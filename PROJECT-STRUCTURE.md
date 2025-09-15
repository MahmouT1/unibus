# Student Portal - Professional Project Structure

## 📁 Project Organization

This project has been professionally reorganized into two main directories for better management and deployment:

```
Student_portal/
├── backend-new/          # Backend API Server
└── frontend-new/         # Frontend Application
```

## 🚀 Backend Structure (`backend-new/`)

### Core Components
- **`api/`** - All API routes and endpoints
- **`middleware/`** - Authentication, security, and validation middleware
- **`models/`** - Database models and schemas
- **`routes/`** - Express.js route handlers
- **`scripts/`** - Database seeding and migration scripts
- **`uploads/`** - File upload storage
- **`config/`** - Configuration files

### Key Files
- `server.js` - Main backend server
- `package.json` - Backend dependencies
- `env.example` - Environment variables template

### API Endpoints
- `/api/auth` - Authentication (login, register, token refresh)
- `/api/students` - Student management
- `/api/attendance` - Attendance tracking
- `/api/subscription` - Subscription management
- `/api/shifts` - Shift management
- `/api/users` - User management
- `/api/expenses` - Expense tracking
- `/api/driver-salaries` - Driver salary management
- `/api/support` - Support ticket system

## 🎨 Frontend Structure (`frontend-new/`)

### Core Components
- **`admin/`** - Admin interface pages
- **`student/`** - Student interface pages
- **`components/`** - Shared React components
- **`lib/`** - Frontend libraries and utilities
- **`public/`** - Static assets (images, icons, etc.)
- **`config/`** - Configuration files

### Key Files
- `package.json` - Frontend dependencies
- `next.config.js` - Next.js configuration
- `jsconfig.json` - JavaScript configuration
- `env.example` - Environment variables template

### Admin Pages
- Dashboard - Overview and statistics
- Attendance - Attendance management
- Subscriptions - Subscription management
- Reports - Financial reports
- Users - User management
- Support - Support ticket management

### Student Pages
- Dashboard - Student overview
- Profile - Student profile management
- QR Code - QR code generation and display
- Transportation - Transportation information

## 🔧 Setup Instructions

### Backend Setup
```bash
cd backend-new
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend-new
npm install
cp env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## 🌐 Deployment

### Backend Deployment
1. Deploy `backend-new/` to your backend server
2. Set up MongoDB database
3. Configure environment variables
4. Run `npm start`

### Frontend Deployment
1. Deploy `frontend-new/` to your frontend server
2. Configure environment variables
3. Run `npm run build`
4. Serve the built files

## 🔗 API Communication

The frontend communicates with the backend through:
- REST API endpoints
- JWT authentication
- CORS configuration
- Environment-based URL configuration

## 📊 Features

### Admin Features
- ✅ Student management
- ✅ Attendance tracking
- ✅ Subscription management
- ✅ Financial reports
- ✅ User management
- ✅ Support ticket system
- ✅ Real-time monitoring
- ✅ Data export/import

### Student Features
- ✅ Profile management
- ✅ QR code generation
- ✅ Transportation information
- ✅ Subscription status
- ✅ Attendance history

## 🛡️ Security

- JWT authentication
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Helmet.js security headers

## 📱 Responsive Design

- Mobile-first approach
- Cross-browser compatibility
- Progressive Web App features
- Touch-friendly interface

## 🔄 Data Flow

1. **Frontend** → API calls → **Backend**
2. **Backend** → Database operations → **MongoDB**
3. **Backend** → Response → **Frontend**
4. **Frontend** → UI updates → **User**

## 📈 Performance

- Server-side rendering (SSR)
- Static site generation (SSG)
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## 🧪 Testing

- Unit tests for backend APIs
- Integration tests for database operations
- Frontend component testing
- End-to-end testing

## 📝 Documentation

- API documentation
- Component documentation
- Deployment guides
- User manuals

## 🚀 Future Enhancements

- Real-time notifications
- Advanced analytics
- Mobile app development
- Third-party integrations
- Advanced reporting features
