# Smart City Parking System - Web UI

A modern, responsive Angular web application for premium city parking management with enterprise-grade authentication and beautiful animations.

## 🚀 Features

- **🔐 Enterprise Authentication**: Secure cookie-based auth with cross-tab persistence
- **🎨 Modern UI/UX**: Glassmorphism design with smooth animations
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts
- **🔄 Real-time Updates**: Dynamic API detection and automatic token injection
- **⚡ Performance**: Optimized with Angular 17+ standalone components
- **🛡️ Security**: CSRF protection, secure cookies, and input validation

## 🏗️ Architecture

### Components Structure
```
src/app/
├── shared/
│   ├── header/          # Navigation header
│   └── footer/          # Site footer
├── home/                # Landing page
├── login/               # Authentication
├── signup/              # User registration
├── dashboard/           # User dashboard
├── services/
│   ├── auth.service.ts  # Authentication logic
│   └── cookie.service.ts # Secure cookie management
└── interceptors/
    └── auth.interceptor.ts # HTTP token injection
```

### Authentication Flow
1. **Login**: Stores auth token in secure cookie + user data in accessible cookie
2. **API Calls**: Interceptor automatically adds `Authorization: Bearer <token>`
3. **Cross-Tab**: Cookies shared across all browser tabs
4. **Logout**: Complete cookie cleanup

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- Angular CLI 17+
- Express.js API server running

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`

### Build for Production
```bash
ng build --configuration production
```
Output: `../API-Service/public/`

## 🔧 Configuration

### API Integration
The app automatically detects the Express server URL:
- Development: `http://localhost:3000/api`
- Production: Dynamic host detection

### Cookie Security Settings
```typescript
// Production settings
secure: true,        // HTTPS only
sameSite: 'strict',  // CSRF protection
expires: 7,          // 7 days
httpOnly: false      // JS accessible for user data
```

## 🎨 UI Components

### Home Page
- Hero section with animated form
- Feature showcase with hover effects
- FAQ with expandable sections
- Parallax scrolling effects

### Authentication
- Glassmorphism login/signup forms
- Real-time validation
- Loading states with spinners
- Error handling with animations

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px, 1200px
- Touch-friendly interactions

## 🔐 Security Features

### Authentication
- Secure cookie storage
- Automatic token refresh
- Cross-tab session sharing
- CSRF protection

### Data Protection
- Input sanitization
- XSS prevention
- Secure HTTP headers
- Privacy-focused cookie handling

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Development
```bash
ng serve --host 0.0.0.0 --port 4200
```

### Production Build
```bash
ng build --configuration production
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 4200
CMD ["npm", "start"]
```

## 🧪 Testing

### Unit Tests
```bash
ng test
```

### E2E Tests
```bash
ng e2e
```

### Build Verification
```bash
ng build --watch
```

## 📦 Dependencies

### Core
- Angular 17+
- RxJS 7+
- TypeScript 5+

### UI/UX
- SCSS for styling
- CSS animations
- Responsive grid system

### Security
- js-cookie for secure cookie management
- HTTP interceptors for token injection

## 🔄 API Integration

### Endpoints
```typescript
POST /api/User/login     // User authentication
POST /api/User/signup    // User registration
GET  /api/health         // Server health check
```

### Request/Response Format
```typescript
// Login Request
{
  username: string,
  password: string
}

// Login Response
{
  message: string,
  data: {
    UserId: string,
    Name: string,
    Email: string,
    Role: string,
    Token: string
  }
}
```

## 🎯 Performance Optimizations

- Lazy loading routes
- OnPush change detection
- Standalone components
- Tree-shaking enabled
- Minification and compression
- Image optimization

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache
ng cache clean
npm ci
```

**Authentication Issues**
```bash
# Check cookies in DevTools
# Verify API server is running
# Check CORS settings
```

**Styling Issues**
```bash
# Rebuild with styles
ng build --extract-css
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@smartcityparking.com
- Documentation: [Wiki](./wiki)

---

**Built with ❤️ using Angular 17+ and modern web technologies**