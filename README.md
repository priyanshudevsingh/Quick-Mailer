# 📧 Quick Mailer

A comprehensive, production-ready email management platform that transforms how you create, send, and manage professional email campaigns. Built with modern web technologies and featuring Gmail integration, rich text editing, mass email capabilities, and a mobile-responsive PWA design.

![Email Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)

## 🚀 Key Features

### 🔐 **Authentication & Security**
- **Google OAuth 2.0** - Secure login with automatic token refresh
- **JWT Authentication** - Stateless session management
- **Gmail API Integration** - Full access to Gmail functionality
- **Auto Token Refresh** - Seamless experience without re-login

### 📧 **Email Management**
- **Rich Text Editor** - Bold, italic, underline, links with Gmail compatibility
- **Email Templates** - Reusable templates with dynamic placeholders
- **Draft Saving** - Save emails as drafts directly in Gmail
- **Email Scheduling** - Schedule emails for future delivery with AM/PM picker
- **Template Previews** - Preview emails with filled placeholders
- **Clickable Links** - Auto-formatted links that work in Gmail

### 📊 **Mass Email Campaigns**
- **Excel Integration** - Upload recipient data via Excel files
- **Bulk Operations** - Send or save hundreds of emails as drafts
- **Template Downloads** - Generate Excel templates with placeholder columns
- **Progress Tracking** - Real-time stats on success/failure rates
- **Personalization** - Dynamic content per recipient

### 📎 **File Management**
- **Multi-format Support** - PDF, DOC, images, videos, and more
- **Drag & Drop Upload** - Intuitive file upload interface
- **File Organization** - Manage and reuse attachments across campaigns
- **Download & Preview** - Access uploaded files anytime

### 📱 **Mobile & PWA**
- **Fully Responsive** - Optimized for phones, tablets, and desktops
- **Progressive Web App** - Install as native app on any device
- **Touch Optimized** - Mobile-friendly interactions and gestures
- **Offline Ready** - Service worker for caching and offline use

### 📈 **Analytics & Tracking**
- **Real-time Dashboard** - Live stats for templates, attachments, emails sent, drafts
- **Auto-incrementing Counters** - Track email activity automatically
- **Campaign Analytics** - Success rates for mass email campaigns
- **User Activity** - Monitor template usage and file uploads

## 🛠️ Tech Stack & Architecture

### **Backend (Node.js + Express)**
```javascript
├── 🚀 Node.js 18+ - High-performance JavaScript runtime
├── ⚡ Express.js - Fast, minimalist web framework
├── 🗃️ PostgreSQL - Robust relational database
├── 🔗 Sequelize ORM - Database modeling and migrations
├── 🔑 Google APIs - Gmail, OAuth 2.0 integration
├── 🛡️ JWT - Secure token-based authentication
├── 📤 Multer - Multi-part file upload handling
├── 📊 XLSX - Excel file parsing and generation
├── 🔧 dotenv - Environment configuration
└── 🏗️ Clean Architecture - SOLID principles, DRY, KISS
```

### **Frontend (React + Vite)**
```javascript
├── ⚛️ React 18+ - Modern UI library with hooks
├── ⚡ Vite - Lightning-fast build tool and dev server
├── 🎨 Tailwind CSS - Utility-first styling framework
├── 🛣️ React Router v6 - Client-side routing
├── 📡 Axios - Promise-based HTTP client
├── 🎭 Lucide React - Beautiful, consistent icons
├── 🍞 React Hot Toast - Elegant notifications
├── 📝 Custom Rich Text Editor - Gmail-compatible formatting
├── 📱 PWA Ready - Service worker + manifest
└── 📋 Context API - State management
```

### **Database Schema**
```sql
Users (id, googleId, email, name, picture, tokens, stats)
Templates (id, userId, name, subject, body, placeholders)
Attachments (id, userId, originalName, filename, path, size)
```

### **Architecture Patterns**
- **🏗️ Clean Architecture** - Separation of concerns, dependency injection
- **🎯 Feature-based Structure** - Modular organization by functionality  
- **🔄 Repository Pattern** - Data access abstraction
- **🛡️ Middleware Pattern** - Authentication, validation, error handling
- **📡 RESTful APIs** - Standard HTTP methods and status codes
- **🔐 JWT + OAuth** - Stateless authentication with Google

## 📋 Prerequisites

```bash
✅ Node.js v18+ (LTS recommended)
✅ PostgreSQL 12+ (with database permissions)
✅ Google Cloud Console account (for OAuth & Gmail API)
✅ Gmail account (for testing email functionality)
```

## 🚀 Quick Start Guide

### **1️⃣ Clone & Install**
```bash
# Clone the repository
git clone <repository-url>
cd email-app

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies  
cd ../frontend && npm install
```

### **4️⃣ Google Cloud Console Setup**
```bash
# 1. Visit Google Cloud Console
https://console.cloud.google.com/

# 2. Create/Select Project → Enable APIs
✅ Gmail API
✅ Google+ API (for user profile)

# 3. Create OAuth 2.0 Credentials
📍 Authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:5000

📍 Authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback
   - http://localhost:3000

# 4. Required OAuth Scopes:
   - email
   - profile
   - https://www.googleapis.com/auth/gmail.send
   - https://www.googleapis.com/auth/gmail.compose
   - https://www.googleapis.com/auth/gmail.modify
```

### **5️⃣ Launch Application**
```bash
# 🚀 Start Backend (Terminal 1)
cd backend
npm run dev
# ✅ Server: http://localhost:5000

# 🎨 Start Frontend (Terminal 2)  
cd frontend
npm run dev
# ✅ App: http://localhost:3000
```

### **6️⃣ First Login**
```bash
1. 🌐 Open http://localhost:3000
2. 🔐 Click "Sign in with Google"
3. ✅ Grant Gmail permissions
4. 🎉 Welcome to your Email Dashboard!
```

## 💡 User Guide & Workflows

### **🔐 Getting Started**
```bash
1. 🌐 Access the app at http://localhost:3000
2. 🔑 Click "Sign in with Google"
3. ✅ Grant permissions:
   - Read/write Gmail access
   - Profile information
4. 📊 View your personalized dashboard
```

### **📝 Creating Email Templates**
```bash
# 📍 Navigate to Templates → New Template
1. 📝 Template Name: "Welcome Email"
2. 📧 Subject: "Welcome {{first_name}}!"
3. 📄 Body: Rich text with placeholders
   - Use {{first_name}}, {{company}}, etc.
   - Apply bold, italic, underline formatting
   - Add clickable links via Link button
   - Use {{}} button to insert placeholders
4. 💾 Save template for reuse
```

### **📎 Managing Attachments**
```bash
# 📍 Navigate to Attachments
✅ Drag & drop files (up to 10MB each)
✅ Supported formats:
   - Documents: PDF, DOC, DOCX, XLS, XLSX, PPT
   - Images: JPG, PNG, GIF, SVG
   - Videos: MP4, AVI, MOV
   - Archives: ZIP, RAR
✅ Organize files with descriptions
✅ Reuse attachments across campaigns
```

### **📧 Crafting Individual Emails**
```bash
# 📍 Navigate to Craft Email
1. 🎯 Step 1: Select Template
   - Choose from saved templates
   - Preview with sample data
   
2. 📎 Step 2: Choose Attachments (Optional)
   - Select multiple files
   - Review file sizes

3. ✉️ Step 3: Compose & Send
   - Fill in placeholder values
   - Enter recipient email
   - Choose action:
     📤 Send Now
     ⏰ Schedule for Later (AM/PM picker)
     💾 Save as Draft (appears in Gmail)
```

### **📊 Mass Email Campaigns**
```bash
# 📍 Navigate to Mass Email
1. 🎯 Select Template
   - Choose template with placeholders
   
2. 📥 Download Excel Template
   - Auto-generated with placeholder columns
   - Include 'email' column for recipients
   
3. 📝 Fill Excel File
   email              | first_name | company    | amount
   john@company.com   | John       | TechCorp   | $1000
   jane@startup.io    | Jane       | StartupInc | $2500
   
4. 📤 Upload & Process
   - Choose attachments (optional)
   - Select action:
     📧 Send Immediately to All
     💾 Save All as Drafts (review in Gmail first)
```

## Key Features Explained

### 💾 Draft Saving
- Save emails as drafts in your Gmail account
- Drafts appear in Gmail's Drafts folder
- Continue editing later in Gmail

### ⏰ Email Scheduling
- Schedule emails for future delivery
- Set specific date and time
- Emails are sent automatically at scheduled time

### ✨ Rich Text Formatting
- Bold, italic, and underline text
- Headers and lists
- Links and clean formatting
- Works with placeholders

### 📊 Mass Email with Excel
- Download Excel template with placeholder headers
- Fill in recipient data (email + placeholder values)
- Upload Excel file for mass sending
- Personalized emails sent to each recipient

## 🔌 API Documentation

### **🔐 Authentication Endpoints**
```http
POST   /api/auth/google/url              # Get Google OAuth URL
GET    /api/auth/google/callback         # Handle OAuth callback  
GET    /api/auth/profile                 # Get current user profile
POST   /api/auth/refresh                 # Refresh expired tokens
```

### **📝 Template Management**
```http
GET    /api/templates                    # List user templates
POST   /api/templates                    # Create new template
GET    /api/templates/:id                # Get template details
PUT    /api/templates/:id                # Update template
DELETE /api/templates/:id                # Soft delete template
```

### **📎 File Attachments**
```http
GET    /api/attachments                  # List user attachments
POST   /api/attachments                  # Upload new file
GET    /api/attachments/:id/download     # Download file
PUT    /api/attachments/:id              # Update file metadata
DELETE /api/attachments/:id              # Soft delete file
```

### **📧 Email Operations**
```http
POST   /api/email/send                   # Send individual email
POST   /api/email/draft                  # Save as Gmail draft
POST   /api/email/mass-email             # Send bulk emails
POST   /api/email/mass-email/drafts      # Save bulk as drafts
GET    /api/email/mass-email/template/:id # Download Excel template
```

### **📊 Analytics & Stats**
```http
GET    /api/stats/dashboard              # Get dashboard statistics
GET    /api/stats/analytics              # Get detailed analytics
```

### **📋 Request/Response Examples**

#### **Send Email**
```json
POST /api/email/send
{
  "to": "recipient@example.com",
  "subject": "Welcome John!",
  "body": "<p>Hello <strong>John</strong>!</p>",
  "templateId": 5,
  "attachmentIds": [1, 2],
  "type": "send", // or "draft", "scheduled"
  "scheduledAt": "2024-01-15T10:30:00Z"
}

Response:
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "messageId": "17a3b2c4d5e6f7g8"
  }
}
```

#### **Mass Email**
```json
POST /api/email/mass-email
Content-Type: multipart/form-data

templateId: 5
attachmentIds: [1,2]
excelFile: [Excel file with recipients]

Response:
{
  "success": true,
  "totalRecipients": 100,
  "successCount": 98,
  "failureCount": 2,
  "results": [...]
}
```

## 🏗️ Project Architecture

```bash
📦 email-app/
├── 🔧 backend/                          # Node.js + Express API
│   ├── 📁 src/
│   │   ├── 🏛️ features/                 # Feature-based architecture
│   │   │   ├── 🔐 auth/
│   │   │   │   ├── controllers/AuthController.js
│   │   │   │   ├── services/AuthService.js
│   │   │   │   ├── models/User.js
│   │   │   │   └── routes/index.js
│   │   │   ├── 📧 email/
│   │   │   │   ├── controllers/EmailController.js
│   │   │   │   ├── services/EmailService.js
│   │   │   │   └── routes/index.js
│   │   │   ├── 📝 templates/
│   │   │   │   ├── controllers/TemplateController.js
│   │   │   │   ├── services/TemplateService.js
│   │   │   │   ├── models/Template.js
│   │   │   │   └── routes/index.js
│   │   │   ├── 📎 attachments/
│   │   │   │   ├── controllers/AttachmentController.js
│   │   │   │   ├── services/AttachmentService.js
│   │   │   │   ├── models/Attachment.js
│   │   │   │   └── routes/index.js
│   │   │   └── 📊 statistics/
│   │   │       ├── controllers/StatisticsController.js
│   │   │       ├── services/StatisticsService.js
│   │   │       └── routes/index.js
│   │   ├── 🔧 shared/                   # Shared utilities
│   │   │   ├── database/index.js
│   │   │   ├── gmail/GmailService.js
│   │   │   └── storage/StorageService.js
│   │   ├── 🛠️ common/                   # Common utilities
│   │   │   ├── constants/index.js
│   │   │   ├── middleware/auth.js
│   │   │   ├── utils/
│   │   │   │   ├── responseUtils.js
│   │   │   │   ├── emailUtils.js
│   │   │   │   └── asyncHandler.js
│   │   │   └── errors/AppError.js
│   │   ├── ⚙️ config/index.js
│   │   └── 🚀 server.js
│   ├── 📤 uploads/                      # File storage
│   ├── 🔐 .env
│   └── 📦 package.json
│
├── 🎨 frontend/                          # React + Vite SPA
│   ├── 📁 src/
│   │   ├── 🧩 components/
│   │   │   ├── GoogleLogin.jsx          # OAuth login component
│   │   │   ├── Layout.jsx               # App layout with navigation
│   │   │   └── RichTextEditor.jsx       # Gmail-compatible editor
│   │   ├── 📄 pages/
│   │   │   ├── Login.jsx                # Login page
│   │   │   ├── SendEmail.jsx            # Dashboard homepage
│   │   │   ├── CraftEmail.jsx           # Individual email composer
│   │   │   ├── MassEmail.jsx            # Bulk email campaigns
│   │   │   ├── Templates.jsx            # Template management
│   │   │   ├── Attachments.jsx          # File management
│   │   │   └── AuthCallback.jsx         # OAuth callback handler
│   │   ├── 🌐 contexts/
│   │   │   └── AuthContext.jsx          # Global auth state
│   │   ├── 🔌 services/
│   │   │   └── api.js                   # API client (Axios)
│   │   ├── 🛠️ utils/
│   │   │   ├── htmlCleaner.js           # HTML sanitization
│   │   │   └── statsUtils.js            # Analytics helpers
│   │   ├── 🎯 App.jsx                   # Main app component
│   │   └── 🎨 index.css                 # Global styles
│   ├── 📱 public/
│   │   ├── manifest.json                # PWA manifest
│   │   ├── sw.js                        # Service worker
│   │   └── icon-*.png                   # App icons
│   ├── 📦 package.json
│   ├── ⚙️ vite.config.js
│   ├── 🎨 tailwind.config.js
│   └── 📄 index.html
│
├── 📚 README.md                          # This file
└── 📄 .gitignore
```

### **🧱 Architecture Principles**

```bash
🏗️ Clean Architecture
├── ✅ Feature-based modules (auth, email, templates, etc.)
├── ✅ Separation of concerns (controller → service → model)
├── ✅ Dependency injection and inversion
├── ✅ Repository pattern for data access
└── ✅ SOLID principles throughout

🔧 Backend Patterns
├── ✅ Express.js with async/await
├── ✅ Sequelize ORM with PostgreSQL
├── ✅ JWT + OAuth 2.0 authentication
├── ✅ Multer for file uploads
├── ✅ Error handling middleware
└── ✅ CORS and security middleware

🎨 Frontend Patterns
├── ✅ React 18 with hooks
├── ✅ Context API for state management
├── ✅ React Router for navigation
├── ✅ Axios for API communication
├── ✅ Tailwind CSS for styling
└── ✅ PWA capabilities
```

## 🚀 Deployment

### **📡 Production Deployment**

#### **Backend (Node.js)**
```bash
# 1. Environment setup
NODE_ENV=production
PORT=443
DATABASE_URL=postgresql://user:pass@prod-host:5432/email_app
FRONTEND_URL=https://yourdomain.com

# 2. Build & deploy
npm run build
pm2 start server.js --name email-api

# 3. Database migration
npm run db:migrate
```

#### **Frontend (Static Hosting)**
```bash
# 1. Build for production
npm run build

# 2. Deploy to Vercel/Netlify/Nginx
# Static files in dist/ folder

# 3. Environment variables
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_prod_client_id
```

### **🐳 Docker Deployment**
```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 5000
CMD ["npm", "start"]

# Dockerfile.frontend  
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## 📊 Performance & Scaling

### **🔧 Optimizations**
- **Caching**: Redis for session storage
- **CDN**: Static assets via CloudFront
- **Database**: Connection pooling, read replicas
- **API**: Rate limiting, compression middleware
- **Files**: S3/MinIO for attachment storage

### **📈 Monitoring**
- **Logs**: Winston + ELK stack
- **Metrics**: Prometheus + Grafana  
- **Uptime**: Pingdom/StatusPage
- **Errors**: Sentry integration

## 🛡️ Security Features

```bash
✅ Google OAuth 2.0 + automatic token refresh
✅ JWT with secure HTTP-only cookies
✅ CORS protection with origin validation
✅ File upload validation & size limits
✅ SQL injection prevention (Sequelize ORM)
✅ XSS protection via HTML sanitization
✅ Rate limiting on API endpoints
✅ HTTPS enforcement in production
```

### **📋 Coding Standards**
- **ESLint + Prettier** for code formatting
- **Conventional Commits** for commit messages
- **JSDoc** comments for functions
- **Error handling** for all async operations

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **📧 Email**: support@yourdomain.com
- **📖 Documentation**: [Wiki Pages](https://github.com/your-repo/wiki)

---

**⭐ Star this repo if it helped you!** | **🔗 Share with your network** | **🤝 Contribute to make it better**
