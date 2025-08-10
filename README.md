# 🚗 Smart City Parking System with QR Ticket Integration

A comprehensive parking management system with **QR ticket generation**, **payment integration**, and **automated entry scanning**.

## ⚡ Quick Start

### Windows
```cmd
start-project.bat
```

### Linux/Mac
```bash
./start-project.sh
```

## 🎯 Complete Feature Set

### 🔐 **User Management**
- Secure authentication with cookie persistence
- User registration and login
- Cross-tab session management

### 🚗 **Vehicle Management**
- Add up to 5 vehicles per user
- Vehicle validation and management
- License plate uniqueness checks

### 🅿️ **Smart Parking System**
- **150 parking spaces** across 3 floors (50 each)
- Real-time availability visualization
- Interactive floor plan selection
- Time-based conflict detection

### 💳 **Payment Integration (Razorpay)**
- Secure payment processing
- Test and live payment modes
- Payment retry for failed transactions
- 5-minute booking hold for failed payments

### 🎫 **QR Ticket System**
- **Automatic ticket generation** after successful payment
- **JWT-secured QR codes** with expiry
- **Industry-standard security** with token validation
- **Mobile-friendly QR display** in reservations

### 📱 **Entry Scanner System**
- **Real-time camera scanning** with ZXing library
- **Automatic QR detection** and validation
- **Access control** with pass/fail display
- **Continuous scanning** for entry gates
- **Multi-camera support** with device selection

## 🔒 Security Features

### **QR Ticket Security**
- **JWT tokens** with expiration and issuer validation
- **Unique ticket numbers** with timestamp and random components
- **Server-side validation** prevents tampering
- **Automatic expiry** after booking start time + 1 hour
- **One-time use** tickets marked as 'used' after scanning

### **Payment Security**
- **Server-side amount calculation** prevents manipulation
- **Razorpay signature verification** for payment authenticity
- **Secure API keys** stored in backend environment
- **Payment status tracking** with proper state management

## 🎮 User Workflow

### **1. Booking Process**
1. **Login/Register** → User authentication
2. **Add Vehicle** → Register car details
3. **Search Parking** → Select date/time (default: now+30min, +1hr)
4. **Choose Space** → Visual floor plan selection
5. **Payment** → Razorpay modal opens immediately
6. **QR Ticket** → Generated automatically on payment success

### **2. Entry Process**
1. **Arrive at Building** → Navigate to `/qr-scanner`
2. **Camera Activation** → System starts continuous scanning
3. **Show QR Code** → Point ticket to camera
4. **Instant Validation** → Pass/Fail with user details
5. **Entry Granted** → Ticket marked as used

### **3. Ticket Management**
- **View Tickets** → QR codes in reservations page
- **Retry Payments** → 5-minute window for failed payments
- **Auto-Cancellation** → Bookings cancelled if not scanned by start time

## 🛠️ Technical Architecture

### **Backend (Express.js + MongoDB)**
```
API-Service/
├── Models/
│   ├── Booking-Model.js     # Booking with payment status
│   ├── Payment-Model.js     # Razorpay payment tracking
│   └── Ticket-Model.js      # QR tickets with JWT tokens
├── Services/
│   ├── ParkingService.js    # Booking and space management
│   ├── PaymentService.js    # Razorpay integration
│   └── TicketService.js     # QR generation and validation
└── Routes/
    ├── Parking-route.js     # Booking APIs
    ├── Payment-route.js     # Payment processing
    └── Ticket-route.js      # Ticket management
```

### **Frontend (Angular 17)**
```
src/app/
├── parking-search/         # Space selection with payment
├── booking-summary/        # Payment confirmation (optional)
├── reservations/           # Booking management + QR display
├── qr-scanner/            # Entry system with camera
└── services/
    ├── parking.service.ts  # Booking APIs
    ├── payment.service.ts  # Payment processing
    └── ticket.service.ts   # Ticket management
```

## 📊 Database Schema

### **Collections**
- **users**: Authentication and profile data
- **cars**: Vehicle information (max 5 per user)
- **parkingspaces**: 150 spaces with floor/position data
- **bookings**: Reservations with payment and ticket status
- **payments**: Razorpay transaction records
- **tickets**: QR codes with JWT tokens and validation

### **Booking States**
- `pending_payment` → Awaiting payment completion
- `active` → Payment completed, ticket generated
- `cancelled` → User cancelled or auto-expired
- `completed` → Parking session finished

### **Payment States**
- `pending` → Payment initiated
- `completed` → Payment successful
- `failed` → Payment failed (5-min retry window)
- `expired` → Payment window expired

### **Ticket States**
- `active` → Valid for entry
- `used` → Scanned and entry granted
- `expired` → Past expiry time
- `cancelled` → Booking cancelled

## 🔧 API Endpoints

### **Parking Management**
```
POST /api/parking/bookings          # Create booking
GET  /api/parking/bookings          # Get user bookings
POST /api/parking/bookings/:id/cancel # Cancel booking
GET  /api/parking/spaces/available  # Search available spaces
```

### **Payment Processing**
```
POST /api/payment/create-order      # Create Razorpay order
POST /api/payment/verify            # Verify payment signature
POST /api/payment/failure           # Handle payment failure
GET  /api/payment/history           # Payment history
```

### **Ticket Management**
```
POST /api/ticket/generate           # Generate QR ticket
POST /api/ticket/validate           # Validate QR code (scanner)
GET  /api/ticket/my-tickets         # User tickets
POST /api/ticket/cleanup-expired    # Admin cleanup
```

## 🎨 UI/UX Features

### **Modern Design**
- **Glassmorphism** cards with blur effects
- **Smooth animations** and transitions
- **Responsive design** for all devices
- **Intuitive navigation** with clear states

### **QR Scanner Interface**
- **Real-time camera** with overlay frame
- **Multi-camera support** with device selection
- **Instant feedback** with success/error states
- **Continuous scanning** for entry gates
- **Professional styling** for kiosk deployment

## 🚀 Deployment & Usage

### **Entry System Setup**
1. **Deploy scanner page** at `/qr-scanner`
2. **Setup kiosk/tablet** at building entrance
3. **Configure camera permissions** for continuous scanning
4. **Test with generated tickets** from reservations

### **Payment Configuration**
1. **Get Razorpay keys** from dashboard
2. **Update .env file** with actual credentials
3. **Test payments** with provided test cards
4. **Switch to live keys** for production

### **Security Considerations**
- **HTTPS required** for camera access
- **JWT secrets** should be strong and unique
- **Regular cleanup** of expired tickets/bookings
- **Rate limiting** on validation endpoints

## 🎉 Success Metrics

### **Complete Integration**
- ✅ **End-to-end workflow** from booking to entry
- ✅ **Secure payment processing** with Razorpay
- ✅ **Industry-standard QR security** with JWT
- ✅ **Real-time camera scanning** with ZXing
- ✅ **Automated cleanup** of expired bookings
- ✅ **Mobile-responsive design** for all devices

### **Business Features**
- ✅ **Revenue protection** with secure payments
- ✅ **Access control** with QR validation
- ✅ **User convenience** with mobile tickets
- ✅ **Operational efficiency** with automated entry
- ✅ **Audit trail** with complete transaction logs

**Ready for production deployment!** 🚗🎫✨

---

## 📱 Quick Access URLs

- **Main App**: `http://localhost:8000`
- **Entry Scanner**: `http://localhost:8000/qr-scanner`
- **Admin Panel**: `http://localhost:8000/dashboard`

**The complete smart parking ecosystem is now operational!** 🏢🚗💳📱