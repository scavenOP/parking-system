# Smart City Parking System - Setup Guide

## 🚀 Quick Start

### 1. Backend Setup (Express + MongoDB)

```bash
cd API-Service
npm install
```

**Environment Variables (.env):**
```
MONGODB_URI=mongodb://localhost:27017/parking-system
PORT=3000
```

**Start Backend:**
```bash
npm start
```

**Initialize Parking Spaces:**
```bash
node init-parking.js
```

### 2. Frontend Setup (Angular)

```bash
cd parking-system-web-UI
npm install
ng serve
```

Navigate to `http://localhost:4200`

## 🎯 Features Implemented

### ✅ User Management
- **Authentication**: Cookie-based with cross-tab persistence
- **Registration**: User signup with validation
- **Login**: Secure authentication flow

### ✅ Car Management
- **Add Cars**: Up to 5 cars per user
- **Car Details**: Make, model, year, color, license plate
- **Validation**: Unique license plates, form validation

### ✅ Parking System
- **3 Floors**: 50 spaces each (10 rows × 5 columns)
- **Real-time Availability**: Green (available) / Red (occupied)
- **Visual Floor Plan**: Interactive parking grid
- **Time-based Booking**: Conflict detection
- **Pricing**: ₹50 per hour

### ✅ Booking System
- **Search**: Available spaces by date/time
- **Selection**: Click to select parking space
- **Car Selection**: Dropdown of available cars
- **Booking Summary**: Duration, amount calculation
- **Confirmation**: Instant booking with validation

## 🗄️ Database Schema

### Collections:
- **users**: User authentication data
- **cars**: User vehicles (max 5 per user)
- **parkingspaces**: 150 spaces (3 floors × 50 spaces)
- **bookings**: Parking reservations with time slots

## 🎨 UI/UX Features

### ✅ Modern Design
- **Glassmorphism**: Translucent cards with blur effects
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design
- **Theme Consistency**: Matches existing home page

### ✅ Navigation
- **Header**: Dynamic navigation based on auth state
- **Protected Routes**: Auth guards for secure pages
- **Breadcrumbs**: Clear navigation flow

## 📱 Pages Structure

```
/                    # Home page with parking info
/login              # User authentication
/signup             # User registration
/cars               # Car management (protected)
/parking-search     # Find & book parking (protected)
/dashboard          # User dashboard (protected)
```

## 🔧 API Endpoints

### Car Management
```
POST /api/parking/cars              # Add new car
GET  /api/parking/cars              # Get user cars
GET  /api/parking/cars/available    # Get available cars for booking
```

### Parking Spaces
```
GET  /api/parking/spaces/available  # Get available spaces
POST /api/parking/spaces/initialize # Initialize parking spaces
```

### Bookings
```
POST /api/parking/bookings          # Create booking
GET  /api/parking/bookings          # Get user bookings
```

## 🚦 Usage Flow

1. **Register/Login** → User creates account
2. **Add Cars** → User adds vehicle details (up to 5)
3. **Search Parking** → Select date/time and car
4. **View Floor Plan** → Visual grid showing availability
5. **Select Space** → Click on green (available) space
6. **Confirm Booking** → Review details and book
7. **Payment** → ₹50/hour automatic calculation

## 🛡️ Security Features

- **Cookie-based Auth**: Secure, cross-tab persistence
- **Route Guards**: Protected pages require authentication
- **Input Validation**: Frontend and backend validation
- **CSRF Protection**: SameSite cookie settings
- **SQL Injection Prevention**: MongoDB with Mongoose

## 🎉 Success!

The parking management system is now fully functional with:
- ✅ **150 parking spaces** across 3 floors
- ✅ **Real-time availability** visualization
- ✅ **Time-based booking** system
- ✅ **Car management** (up to 5 per user)
- ✅ **Modern UI/UX** with animations
- ✅ **Enterprise security** patterns
- ✅ **Mobile responsive** design

**Ready to use!** 🚗🅿️