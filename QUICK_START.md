# 🚀 Quick Start: Serverless Deployment

Get your Quick-Mailer backend running on AWS Lambda in 5 minutes!

## ⚡ Quick Commands

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Setup AWS resources (one-time)
./scripts/setup-aws.sh

# 3. Configure environment
cp env.serverless.example .env
# Edit .env with your values

# 4. Deploy to AWS
npm run deploy

# 5. Get your API URL
npm run logs
```

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
AWS_REGION=us-east-1

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
VITE_API_URL=https://your-api-gateway-url.amazonaws.com/prod/api
```

## 🆘 Need Help?

- 📖 [Full Deployment Guide](backend/DEPLOYMENT.md)
- 🐛 [Troubleshooting](backend/DEPLOYMENT.md#troubleshooting)
- 📧 Check GitHub Issues

---

**🎯 Goal**: Backend scales automatically, costs nothing when idle, and updates via CI/CD!
