# SMARTSTUDY PLANNER - DEVOPS TOOLS & INFRASTRUCTURE GUIDE

**Comprehensive Documentation of Current and Recommended DevOps Tools**

---

## TABLE OF CONTENTS

1. [Current DevOps Stack](#current-devops-stack)
2. [Recommended Tools (Not Yet Implemented)](#recommended-tools)
3. [CI/CD Pipeline Architecture](#cicd-pipeline)
4. [Deployment Strategy](#deployment-strategy)
5. [Monitoring & Logging](#monitoring--logging)
6. [Infrastructure as Code (IaC)](#infrastructure-as-code)

---

## CURRENT DEVOPS STACK

### 1. Git & GitHub
**Purpose:** Version control and repository hosting  
**Status:** ✅ Active  
**Configuration:**
- Repository: `github.com/[username]/SMARTSTUDY-PLANNER`
- Branches: `main` (production), `develop` (staging), feature branches
- Protected main branch: Requires PR review before merge

**Current Setup:**
```
.git/
├── commits (local history)
├── branches (main, develop)
└── remote (origin/main, origin/develop)
```

**Next Steps:**
- Set branch protection rules
- Add CODEOWNERS file
- Create PR templates

---

### 2. Docker
**Purpose:** Application containerization  
**Status:** ⚠️ Files exist, not actively used in dev  
**Location:** 
- Backend: `backend/Dockerfile`
- Frontend: `frontend/Dockerfile`
- Compose: `docker-compose.yml`

**Current Configuration:**

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb+srv://...
      - JWT_SECRET=your_secret_key
      - NODE_ENV=development

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

**To Run Locally:**
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Status Notes:** Docker is configured but development uses npm directly for faster iteration. Docker should be used for:
- Production deployments
- CI/CD pipeline validation
- Team consistency

---

### 3. npm & Node.js Package Management
**Purpose:** Dependency management  
**Status:** ✅ Active  
**Node Version:** 18+ (specified in Dockerfile)

#### Backend Dependencies (`backend/package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

#### Frontend Dependencies (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "@fullcalendar/react": "^6.0.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.0"
  }
}
```

**Update Dependencies:**
```bash
npm outdated  # Check for updates
npm update    # Update all packages
npm audit     # Check for vulnerabilities
```

---

### 4. MongoDB Atlas
**Purpose:** Cloud database hosting  
**Status:** ✅ Active & Connected  
**Configuration:**
- Service: MongoDB Atlas (Cloud)
- Plan: Shared tier (free/paid)
- Region: Auto-selected based on location
- Connection String: Stored in `.env` as `MONGO_URI`

**Current Connection:**
```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/smartstudy?retryWrites=true&w=majority
```

**Database Structure:**
```
Database: smartstudy
├── users (authentication & profiles)
├── tasks (task data & metadata)
├── sessions (study block tracking)
└── recommendations (AI suggestions)
```

**To Monitor:**
- Log in to Atlas dashboard
- View connection metrics
- Check database size and storage
- Review backup status

---

## RECOMMENDED TOOLS (NOT YET IMPLEMENTED)

### Priority 1: CRITICAL (Implement Immediately)

#### 1. GitHub Actions (CI/CD)
**Purpose:** Automated testing and deployment on every push  
**Status:** ❌ NOT IMPLEMENTED  
**Setup Time:** 2-3 hours  

**What It Does:**
- Runs tests on every push
- Checks code quality (ESLint)
- Builds Docker images
- Prevents broken code from merging

**Implementation:**

Create `.github/workflows/ci-cd.yml`:
```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install backend dependencies
        run: cd backend && npm install

      - name: Install frontend dependencies
        run: cd frontend && npm install

      - name: Lint backend
        run: cd backend && npm run lint

      - name: Lint frontend
        run: cd frontend && npm run lint

      - name: Test backend
        run: cd backend && npm test
        env:
          MONGO_URI: mongodb://localhost:27017/smartstudy-test
          JWT_SECRET: test_secret

      - name: Build frontend
        run: cd frontend && npm run build

      - name: Build Docker images
        run: docker-compose build

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

**Cost:** FREE  
**Benefit:** Catches bugs before production

---

#### 2. Jest & Supertest (Testing Framework)
**Purpose:** Unit & integration testing  
**Status:** ⚠️ Partially installed, not used  
**Setup Time:** 3-4 hours  

**Installation:**
```bash
# Backend
cd backend
npm install --save-dev jest supertest @types/jest

# Frontend
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Sample Backend Test:**
```javascript
// backend/__tests__/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

**Sample Frontend Test:**
```javascript
// frontend/src/__tests__/DashboardPage.test.js
import { render, screen } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';

describe('DashboardPage', () => {
  it('renders welcome banner', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});
```

**Cost:** FREE  
**Benefit:** Catch regressions automatically

---

#### 3. Vercel (Frontend Deployment)
**Purpose:** Automated React deployment  
**Status:** ❌ NOT IMPLEMENTED  
**Setup Time:** 1-2 hours  

**Steps:**
1. Go to vercel.com, sign up with GitHub
2. Import your repository
3. Set environment variable: `REACT_APP_API_URL=https://your-backend.com`
4. Click Deploy

**Features:**
- Automatic deployment on push to `main`
- Preview URLs for PRs
- Built-in CI/CD
- Global CDN

**Cost:** FREE tier available ($20/mo for pro)

---

#### 4. Render (Backend Deployment)
**Purpose:** Node.js/Express hosting  
**Status:** ❌ NOT IMPLEMENTED  
**Setup Time:** 1-2 hours  

**Steps:**
1. Go to render.com, sign up with GitHub
2. Create new "Web Service"
3. Connect your GitHub repo, select `backend` directory
4. Set environment variables:
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=[your-secret]`
   - `NODE_ENV=production`
5. Deploy

**Features:**
- Automatic deployment on push
- Free SSL certificates
- Database backups
- 24/7 uptime monitoring

**Cost:** FREE tier available ($7/mo for hobby)

---

### Priority 2: IMPORTANT (Implement in Phase 2)

#### 5. ESLint & Prettier
**Purpose:** Code quality & formatting  
**Status:** ❌ NOT IMPLEMENTED  

**Installation:**
```bash
npm install --save-dev eslint prettier eslint-config-prettier
```

**Configuration (`.eslintrc.json`):**
```json
{
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "prettier"]
}
```

---

#### 6. Sentry (Error Tracking)
**Purpose:** Production error monitoring  
**Status:** ❌ NOT IMPLEMENTED  

**Installation:**
```bash
npm install @sentry/react @sentry/node
```

**Configuration:**
```javascript
// Backend
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "https://xxx@sentry.io/xxx" });

// Frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "https://xxx@sentry.io/xxx" });
```

**Cost:** FREE for basic tier

---

#### 7. Redis (Caching)
**Purpose:** Performance optimization & session storage  
**Status:** ❌ NOT IMPLEMENTED  

**Use Case:**
```javascript
// Cache task list for faster retrieval
const redis = require('redis');
const client = redis.createClient();

// Store: client.set('tasks:' + userId, JSON.stringify(tasks), 'EX', 3600);
// Retrieve: client.get('tasks:' + userId);
```

**Deployment Option:** Redis Cloud (free tier available)

---

### Priority 3: OPTIONAL (Nice-to-Have)

#### 8. AWS (Enterprise Infrastructure)
**Purpose:** Scalable cloud infrastructure  
**Services Relevant:**
- **EC2:** Virtual servers
- **RDS:** Managed database
- **S3:** File storage
- **Lambda:** Serverless functions
- **CloudFront:** CDN

---

#### 9. Nginx (Reverse Proxy)
**Purpose:** Load balancing and SSL termination  
**Configuration:**
```nginx
upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name yourdomain.com;
  
  location /api {
    proxy_pass http://backend;
  }
  
  location / {
    root /var/www/frontend;
  }
}
```

---

#### 10. New Relic (Application Performance Monitoring)
**Purpose:** Real-time performance metrics  
**Cost:** Starts at $99/month

---

## CI/CD PIPELINE ARCHITECTURE

### Current Flow (Local Only)
```
Developer writes code
    ↓
npm run build
    ↓
npm test
    ↓
Manual deployment
```

### Proposed Flow (With GitHub Actions + Vercel + Render)
```
Developer pushes to GitHub (main branch)
    ↓
GitHub Actions triggers
    ├─ ESLint checks
    ├─ npm test (Jest)
    ├─ Build Docker image
    └─ Run integration tests
    ↓
All tests pass? → Merge to main
    ↓
Vercel deploys frontend automatically
    ↓
Render deploys backend automatically
    ↓
Sentry monitors errors in production
    ↓
Health check monitors uptime
```

---

## DEPLOYMENT STRATEGY

### Development Environment
```
Local Machine
├─ npm start (frontend on :3000)
├─ npm start (backend on :5000)
└─ MongoDB Atlas (cloud database)
```

### Production Environment (Recommended)
```
GitHub (Code Repository)
    ↓
GitHub Actions (CI/CD)
    ├─ Tests
    └─ Build
    ↓
├─ Vercel (Frontend)
│  └─ https://smartstudy.vercel.app
│
└─ Render (Backend)
   └─ https://smartstudy-api.onrender.com
   
MongoDB Atlas (Cloud Database)
└─ https://cloud.mongodb.com
```

---

## MONITORING & LOGGING

### Recommended Monitoring Stack

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** | Error tracking | FREE tier |
| **UptimeRobot** | Uptime monitoring | FREE tier |
| **Vercel Analytics** | Frontend performance | Built-in |
| **Render Dashboard** | Backend metrics | Built-in |
| **MongoDB Atlas Metrics** | Database performance | Built-in |

---

## INFRASTRUCTURE AS CODE (IaC)

### Docker Compose (Current)
Existing `docker-compose.yml` serves as IaC for local development

### Terraform (Enterprise Grade)
Example for AWS deployment:
```hcl
# Not yet implemented
resource "aws_instance" "backend" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "smartstudy-backend"
  }
}
```

---

## SECURITY CONSIDERATIONS

### Current Security
- ✅ JWT authentication
- ✅ Password hashing (bcryptjs)
- ✅ CORS configured

### Missing Security
- ❌ Rate limiting
- ❌ Input sanitization
- ❌ Security headers (Helmet.js)
- ❌ HTTPS enforcement
- ❌ Secret management

### Recommended Security Stack
1. **Helmet.js** - Security headers
2. **express-rate-limit** - Rate limiting
3. **xss-clean** - XSS protection
4. **express-validator** - Input validation
5. **helmet-csp** - Content Security Policy

---

## COST BREAKDOWN (Monthly)

| Service | Cost | Required |
|---------|------|----------|
| GitHub | FREE | Yes |
| GitHub Actions | FREE (2000 min/mo) | Yes |
| Vercel | FREE | Yes |
| Render | FREE | Yes |
| MongoDB Atlas | FREE (512MB storage) | Yes |
| Sentry | FREE | Optional |
| Redis Cloud | FREE | Optional |
| **Total (Free Tier)** | **$0/mo** | - |
| **Production (Paid)** | **$27-40/mo** | - |

---

## SUMMARY TABLE

| Tool | Category | Status | Priority | Cost |
|------|----------|--------|----------|------|
| Git + GitHub | SCM | ✅ Active | High | FREE |
| Docker | Containerization | ⚠️ Configured | High | FREE |
| npm | Package Mgmt | ✅ Active | High | FREE |
| MongoDB Atlas | Database | ✅ Active | High | FREE |
| GitHub Actions | CI/CD | ❌ Not Implemented | Critical | FREE |
| Jest | Testing | ⚠️ Installed | Critical | FREE |
| Vercel | Deployment | ❌ Not Implemented | Critical | FREE |
| Render | Deployment | ❌ Not Implemented | Critical | FREE |
| ESLint | Code Quality | ❌ Not Implemented | Important | FREE |
| Sentry | Monitoring | ❌ Not Implemented | Important | FREE |
| Redis | Caching | ❌ Not Implemented | Optional | FREE |
| AWS | Infrastructure | ❌ Not Considered | Optional | $$ |

---

**Document Version:** 2.0  
**Date:** May 27, 2026  
**Last Updated:** May 27, 2026  
**Status:** Ready for Implementation
