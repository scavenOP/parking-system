# Azure App Service Deployment Guide

## Prerequisites

1. **Azure App Service** - Create a Node.js app service in Azure
2. **GitHub Repository** - Your code should be in a GitHub repository

## Setup Steps

### 1. Azure App Service Configuration

1. Create a new **App Service** in Azure Portal
2. Choose **Node.js** as the runtime stack
3. Set **Node.js version** to **20 LTS**
4. Enable **Continuous Deployment** from GitHub

### 2. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

```
AZURE_WEBAPP_NAME: your-app-service-name
AZURE_WEBAPP_PUBLISH_PROFILE: <download from Azure Portal>
```

**To get the Publish Profile:**
1. Go to your App Service in Azure Portal
2. Click **Get publish profile** 
3. Copy the entire XML content
4. Paste it as the value for `AZURE_WEBAPP_PUBLISH_PROFILE`

### 3. Environment Variables

Set these in Azure App Service **Configuration** → **Application settings**:

```
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=20.x
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

Add your application-specific environment variables:
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## Deployment Process

### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- GitHub Actions will:
  1. Build Angular app
  2. Install API dependencies  
  3. Deploy to Azure App Service

### Manual Deployment
Run the workflow manually:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to Azure App Service**
3. Click **Run workflow**

## Project Structure

```
parking-system/
├── .github/workflows/azure-deploy.yml    # GitHub Actions workflow
├── API-Service/                          # Express.js backend
│   ├── public/browser/                   # Angular build output (auto-generated)
│   ├── index.js                         # Main server file
│   ├── package.json                     # API dependencies
│   └── web.config                       # Azure IIS configuration
├── parking-system-web-UI/               # Angular frontend
│   ├── src/                             # Angular source code
│   ├── angular.json                     # Build config (outputs to ../API-Service/public)
│   └── package.json                     # Angular dependencies
├── .deployment                          # Azure deployment config
└── deploy.cmd                          # Custom deployment script
```

## Build Process

1. **Angular Build**: `parking-system-web-UI` → `API-Service/public/browser/`
2. **API Serve**: Express serves both API routes and Angular static files
3. **Single Server**: Everything runs on one Node.js process

## Troubleshooting

### Build Failures
- Check **Deployment Center** logs in Azure Portal
- Verify all environment variables are set
- Ensure Node.js version is 20.x

### Runtime Issues
- Check **Log stream** in Azure Portal
- Verify MongoDB connection string
- Check API endpoints at `/api/health`

### Static Files Not Loading
- Verify Angular build outputs to `API-Service/public/browser/`
- Check `web.config` rewrite rules
- Ensure Express static middleware is configured

## URLs After Deployment

- **Main App**: `https://your-app-name.azurewebsites.net`
- **API Health**: `https://your-app-name.azurewebsites.net/api/health`
- **QR Scanner**: `https://your-app-name.azurewebsites.net/qr-scanner`

## Security Notes

- Use **HTTPS** for production (automatic with Azure App Service)
- Store sensitive data in **Azure Key Vault** or **App Settings**
- Enable **Authentication** if needed
- Configure **CORS** properly for your domain