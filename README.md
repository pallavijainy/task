# 🎯 Attendance Management System

A full-stack MERN application for managing employee attendance with location tracking, live photo verification, and role-based access control.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [Core Functionality](#core-functionality)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Assumptions](#assumptions)

## ✨ Features

### Core Features (Implemented)
- ✅ **Authentication & Authorization**
  - Secure JWT-based authentication
  - Role-based access control (Employee, Manager, Admin)
  - Protected routes on frontend and backend

- ✅ **Attendance Management**
  - Punch In/Punch Out functionality
  - Live selfie capture (camera-based, no file uploads)
  - Location tracking (latitude & longitude)
  - Working hours calculation (8-hour standard shift)
  - Attendance status (Completed/Incomplete)

- ✅ **Overtime Management**
  - Employee can request overtime with reason
  - Manager/Admin can approve or reject requests
  - Status tracking and remarks system

- ✅ **Role-Based Dashboards**
  - **Employee Dashboard**: Personal attendance, overtime requests
  - **Manager Dashboard**: Team attendance, validation, overtime approvals
  - **Admin Dashboard**: System-wide monitoring, user management

- ✅ **Attendance Validation**
  - View employee selfies
  - Mark attendance as Valid/Invalid
  - Add remarks and notes
  - Validation status tracking

- ✅ **Reports & History**
  - Daily attendance reports
  - Attendance history with filters
  - Overtime request history
  - Validation status tracking

### Bonus Features (Implemented)
- ✅ Clean, modern UI with Tailwind CSS
- ✅ Real-time attendance status
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states and error handling
- ✅ Photo preview functionality

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - API calls and caching
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Morgan** - HTTP request logging

## 🏗 Architecture

### Project Structure

```
pallavi-task/
├── Frontend/
│   ├── src/
│   │   ├── app/             # Redux store configuration
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Layout components (Sidebar, Header, etc.)
│   │   │   └── ui/          # UI primitives (Button, Card, Input, etc.)
│   │   ├── features/        # Feature-based modules
│   │   │   ├── auth/        # Authentication (authSlice, authApi)
│   │   │   ├── attendance/  # Attendance management
│   │   │   ├── overtime/    # Overtime management
│   │   │   └── user/        # User management
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── manager/     # Manager pages
│   │   │   └── employee/    # Employee pages
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
│
└── Backend/
    ├── src/
    │   ├── config/          # Configuration files (database)
    │   ├── controllers/     # Request handlers
    │   ├── middleware/      # Auth & role middleware
    │   ├── models/          # Mongoose models
    │   ├── routes/          # API routes
    │   ├── utils/           # Utility functions
    │   └── server.js        # Server entry point
    ├── scripts/             # Utility scripts
    └── package.json
```

### Data Models

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee/manager/admin),
  managerId: ObjectId (ref: User),
  createdAt: Date
}
```

#### Attendance Model
```javascript
{
  employee: ObjectId (ref: User),
  punchInTime: Date,
  punchOutTime: Date,
  totalWorkingHours: Number,
  workingStatus: String (incomplete/completed),
  selfie: String (base64),
  location: {
    latitude: Number,
    longitude: Number
  },
  validationStatus: String (pending/valid/invalid),
  validationRemarks: String,
  validatedBy: ObjectId (ref: User),
  overtimeStatus: String (none/pending/approved/rejected),
  date: String
}
```

#### Overtime Model
```javascript
{
  employee: ObjectId (ref: User),
  attendance: ObjectId (ref: Attendance),
  hours: Number,
  reason: String,
  status: String (pending/approved/rejected),
  remarks: String,
  approvedBy: ObjectId (ref: User)
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd pallavi-task
```

#### 2. Backend Setup
```bash
cd Backend
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env

# Edit .env with your configuration
```

#### 3. Frontend Setup
```bash
cd Frontend
npm install
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

#### 5. (Optional) Create Test Users
```bash
cd Backend
node scripts/createTestUsers.js
```

This creates:
- **Admin**: admin@test.com / admin123
- **Manager**: manager@test.com / manager123
- **Employee**: employee@test.com / employee123

## 🔐 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/attendance-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/attendance-app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (Optional)
Create `Frontend/.env` if you need to customize:
```env
VITE_API_URL=http://localhost:5000
```

## 👥 User Roles

### Employee
- ✅ View personal dashboard
- ✅ Punch In/Out with selfie and location
- ✅ View attendance history
- ✅ Request overtime
- ✅ Track overtime status

### Manager
- ✅ View team dashboard
- ✅ Monitor team attendance
- ✅ Validate attendance (view selfies, mark valid/invalid)
- ✅ Approve/reject overtime requests
- ✅ Add remarks to validations

### Admin
- ✅ Full system access
- ✅ View all users
- ✅ Monitor all attendance records
- ✅ Validate any attendance
- ✅ Approve/reject any overtime
- ✅ System-wide reports

## 🔄 Core Functionality

### Attendance Flow
1. Employee clicks "Punch In"
2. Camera opens for selfie capture
3. Selfie is captured (base64)
4. Location is captured (geolocation API)
5. Attendance record created with:
   - Punch-in time
   - Selfie
   - Location (lat/lng)
   - Status: incomplete
6. Employee works and clicks "Punch Out"
7. System calculates working hours
8. Status updated:
   - **Completed**: ≥ 8 hours
   - **Incomplete**: < 8 hours

### Overtime Workflow
1. Employee requests overtime after punch-out
2. Provides hours and reason
3. Request goes to Manager/Admin
4. Manager/Admin reviews and:
   - Approves (with optional remarks)
   - Rejects (with mandatory remarks)
5. Status reflected in attendance record

### Validation Workflow
1. Manager/Admin views attendance records
2. Clicks "Review" to see details:
   - Employee info
   - Punch times
   - Selfie image
   - Location
   - Working hours
3. Marks as:
   - **Valid**: Authentic attendance
   - **Invalid**: Fake/suspicious (requires remarks)
4. Validation saved and visible to employee

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/signup     - Register new user
POST   /api/auth/login      - Login user
GET    /api/auth/me         - Get current user (protected)
```

### Attendance Endpoints
```
POST   /api/attendance/punch-in       - Punch in (employee)
POST   /api/attendance/punch-out      - Punch out (employee)
GET    /api/attendance/today          - Get today's attendance (employee)
GET    /api/attendance/my-attendance  - Get my history (employee)
GET    /api/attendance/team           - Get team attendance (manager)
GET    /api/attendance/all            - Get all attendance (admin)
PATCH  /api/attendance/:id/validate   - Validate attendance (manager/admin)
```

### Overtime Endpoints
```
POST   /api/overtime/request          - Create overtime request (employee)
GET    /api/overtime/my-requests      - Get my requests (employee)
GET    /api/overtime/pending          - Get pending requests (manager)
GET    /api/overtime/all              - Get all requests (admin)
PATCH  /api/overtime/:id/approve      - Approve request (manager/admin)
PATCH  /api/overtime/:id/reject       - Reject request (manager/admin)
```

### User Endpoints
```
GET    /api/users/team-members        - Get team members (manager)
GET    /api/users/all                 - Get all users (admin)
```

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Prepare for deployment:**
   - Ensure `.env` variables are configured
   - Set `NODE_ENV=production`
   - Update `FRONTEND_URL` to your deployed frontend URL

2. **Deploy to Render:**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables
   - Deploy!

### Frontend Deployment (Vercel/Netlify)

1. **Build the app:**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```
   OR push to GitHub and connect via Vercel dashboard

3. **Configure environment:**
   - Set `VITE_API_URL` to your backend URL

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Add database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string
5. Update `MONGO_URI` in backend `.env`

## 📝 Assumptions

### Technical Assumptions
1. **Browser Compatibility**: Modern browsers with camera and geolocation support
2. **Image Storage**: Selfies stored as base64 in MongoDB (suitable for MVP; consider cloud storage for production)
3. **Time Zone**: All times stored in UTC; frontend displays in local time
4. **Standard Shift**: 8-hour workday is the standard for all employees
5. **Geolocation**: User grants location permission; no fallback if denied

### Business Logic Assumptions
1. **Single Daily Attendance**: One punch-in/punch-out per employee per day
2. **Punch Out Before Midnight**: Assumed attendance doesn't span multiple days
3. **Manager Hierarchy**: Employees have one assigned manager via `managerId`
4. **Admin Privileges**: Admins have full access to all features
5. **Validation Optional**: Attendance can exist without validation
6. **Overtime Post-Shift**: Overtime can only be requested after punch-out
7. **Retroactive Changes**: No editing of past attendance (can be added later)

### Security Assumptions
1. **JWT Tokens**: 30-day expiration (adjust for production)
2. **Password Policy**: Minimum 6 characters (can be strengthened)
3. **HTTPS**: Assumed for production deployment
4. **CORS**: Configured for specific frontend origin

### Features Not Implemented (Out of Scope)
- Geofencing (restrict attendance within radius)
- Real-time notifications (Socket.IO)
- Export reports (PDF/Excel)
- Dark mode
- Email notifications
- Multi-day shift support
- Attendance editing/deletion
- Leave management
- Payroll integration

## 🧪 Testing

### Manual Testing
1. Create test users using the script
2. Test all three role perspectives
3. Verify attendance flow end-to-end
4. Test overtime workflow
5. Test validation workflow

### Test Scenarios
- **Employee**: Punch in/out, view history, request overtime
- **Manager**: View team, validate attendance, approve/reject OT
- **Admin**: Monitor system, manage users, all validations

## 🐛 Known Issues

1. **Sidebar Navigation**: Currently all items redirect to dashboard - needs separate route handling (being fixed)
2. **Large Images**: Base64 storage may cause performance issues with many records
3. **Time Zones**: Ensure server and client are timezone-aware

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error logs and steps to reproduce

## 📄 License

This project is created as an assessment submission.

---

**Built with ❤️ using MERN Stack**
