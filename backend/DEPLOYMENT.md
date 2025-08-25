# 🚀 Serverless Deployment Guide

This guide explains how to deploy your Quick-Mailer backend to AWS Lambda + API Gateway for zero idle cost.

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **Node.js 18+** installed locally
3. **AWS CLI** configured with credentials
4. **GitHub repository** with your code

## 🏗️ Architecture Overview

```
Frontend (Vercel) → API Gateway → Lambda Function → PostgreSQL (Avien)
                                    ↓
                              S3 Bucket (Attachments)
```

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. AWS S3 Bucket Setup

Create an S3 bucket for file attachments:

```bash
aws s3 mb s3://your-quick-mailer-attachments-bucket
aws s3api put-bucket-cors --bucket your-quick-mailer-attachments-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}'
```

### 3. Environment Variables

Copy the template and fill in your values:

```bash
cp env.serverless.example .env
```

**Required Variables:**
- `DATABASE_URL`: Your Avien PostgreSQL connection string
- `JWT_SECRET`: Random string for JWT signing
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `S3_BUCKET`: Your S3 bucket name

### 4. Local Testing

Test the serverless setup locally:

```bash
npm run dev:serverless
```

## 🚀 Deployment

### Manual Deployment

```bash
# Deploy to production
npm run deploy

# Deploy to development
npm run deploy:dev

# Remove deployment
npm run remove
```

### Automated CI/CD

The GitHub Actions workflow automatically deploys on push to `main`:

1. **Add GitHub Secrets:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `S3_BUCKET`

2. **Push to main branch** - deployment happens automatically

## 🔗 API Endpoints

After deployment, your API will be available at:
```
https://[api-id].execute-api.[region].amazonaws.com/prod/api/
```

**Available endpoints:**
- `POST /api/auth/google` - Google OAuth
- `GET /api/templates` - List templates
- `POST /api/attachments` - Upload files
- `POST /api/email/send` - Send emails
- `GET /api/stats` - Dashboard statistics

## 📁 File Storage

- **Development**: Local `uploads/` directory
- **Production**: S3 bucket with automatic switching
- **Security**: Presigned URLs for secure uploads/downloads

## 🔍 Monitoring & Logs

```bash
# View Lambda logs
npm run logs

# CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/quick-mailer-api"
```

## 💰 Cost Optimization

- **Zero idle cost** - Lambda only charges per request
- **Automatic scaling** - Handles traffic spikes
- **Cold start optimization** - No VPC attachment
- **Memory optimization** - 1024MB allocated (adjustable)

## 🚨 Troubleshooting

### Common Issues

1. **CORS errors**: Check `FRONTEND_URL` in environment
2. **File upload failures**: Verify S3 bucket permissions
3. **Database connection**: Ensure `DATABASE_URL` is accessible from Lambda
4. **Google OAuth**: Update redirect URI to new API Gateway URL

### Debug Commands

```bash
# Test Lambda locally
serverless invoke local --function api --path test-event.json

# Check deployment status
serverless info --stage prod

# View function configuration
serverless print --stage prod
```

## 🔄 Updates & Rollbacks

### Update Deployment

```bash
# Deploy new version
npm run deploy

# Rollback to previous version
serverless rollback --stage prod
```

### Blue-Green Deployment

For zero-downtime updates, use stages:

```bash
# Deploy to staging
npm run deploy:dev

# Test staging
# If successful, promote to production
serverless deploy --stage prod
```

## 📚 Additional Resources

- [Serverless Framework Documentation](https://www.serverless.com/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)

## 🆘 Support

For deployment issues:
1. Check CloudWatch logs
2. Verify environment variables
3. Test locally with `serverless offline`
4. Review IAM permissions
