# 🚀 Quick Start: Serverless Deployment

Get your Quick-Mailer backend running on AWS Lambda in 5 minutes!

## 🚀 Quick Start Guide

### Option 1: Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```

### Option 2: Serverless Deployment (AWS Lambda) - Recommended

#### Prerequisites
- AWS Account with CLI access
- GitHub repository
- PostgreSQL database (Avien)

#### Backend Deployment
```bash
# 1. Clone and setup
git clone https://github.com/priyanshudevsingh/Quick-Mailer.git
cd Quick-Mailer/backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp env.serverless.example .env
# Edit .env with your values

# 4. Deploy to AWS Lambda
npm run deploy
```

#### Frontend Configuration
```bash
# 1. Update environment variables
cd frontend
cp env.example .env

# 2. Set production API URL (NO /prod prefix)
VITE_API_URL=https://[api-id].execute-api.us-east-1.amazonaws.com
```

#### Test Your Deployment
```bash
# Health check (should return 200 OK)
curl https://[api-id].execute-api.us-east-1.amazonaws.com/api/health

# Test auth endpoint
curl https://[api-id].execute-api.us-east-1.amazonaws.com/api/auth/google/url
```

## 🎯 Expected Results
- ✅ Backend: AWS Lambda + API Gateway
- ✅ Frontend: Vercel deployment
- ✅ API URLs: Simple `/api/*` format (no `/prod`)
- ✅ Authentication: Google OAuth working
- ✅ All endpoints: Accessible via `/api/*`

## 🔑 Required Environment Variables

```bash
# Database (Avien PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-super-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# AWS
S3_BUCKET=your-bucket-name
# Note: AWS_REGION is automatically provided by Lambda, don't set it manually

# Frontend
FRONTEND_URL=https://your-app.vercel.app
```

## 🌐 What You Get

- **Zero idle cost** - Pay only per request
- **Auto-scaling** - Handles traffic spikes
- **Global CDN** - Fast response times
- **S3 file storage** - Secure attachments
- **Automatic CI/CD** - Deploy on git push

## 🔗 Your API Endpoints

After deployment, your API will be available at:
```
https://[api-id].execute-api.us-east-1.amazonaws.com/prod/api/
```

## 📱 Frontend Integration

Update your Vercel frontend with:
```bash
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod
```

## 🆘 Need Help?

- 📖 [Full Deployment Guide](backend/DEPLOYMENT.md)
- 🐛 [Troubleshooting](backend/DEPLOYMENT.md#troubleshooting)
- 📧 Check GitHub Issues

---

**🎯 Goal**: Backend scales automatically, costs nothing when idle, and updates via CI/CD!
