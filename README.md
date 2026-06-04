# SmartStudy Planner

An AI-Driven Web Application for Academic Management

## Project Overview

SmartStudy Planner is a comprehensive solution designed to help university students manage their academic workload efficiently. By leveraging AI and behavioral analysis, the application provides adaptive study schedules based on individual productivity patterns and historical performance.

**University of Buea - Department of Computer Engineering**  
**CEC418: Software Construction and Evolution**  
**Level 400**

**Student:** Enongene Clovis (CT23A095)  
**Instructor:** Mr. Kometa Dennis

## Key Features

- **Secure Authentication:** JWT-based login system
- **Task Management:** Full CRUD operations with priority-level tagging
- **Calendar Integration:** FullCalendar-based UI for time blocking
- **AI Recommendations:** Adaptive scheduling based on user behavior
- **Real-time Progress:** Live task progress tracking
- **Study Buffers:** Automatic time adjustment based on historical patterns
- **Dark/Light Mode:** Responsive interface with theme toggle

## Technology Stack

### Frontend
- **React.js** - Component-based UI
- **Tailwind CSS** - Rapid, responsive styling
- **FullCalendar** - Calendar integration
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - ODM
- **JWT** - Authentication

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel/Render** - Deployment

## Project Structure

```
smartstudy-planner/
├── frontend/              # React application
├── backend/               # Node.js/Express API
├── docs/                  # Technical documentation
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smartstudy-planner
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

The application will be available at `http://localhost:3000`

## Production Deployment

### Local production with Docker Compose

1. Create a `.env` file in the project root with production values:
   ```bash
   JWT_SECRET=your_production_jwt_secret
   FRONTEND_URL=http://localhost:3000
   REACT_APP_API_URL=http://localhost:5000
   MONGODB_URI=mongodb://root:password@mongodb:27017/smartstudy?authSource=admin
   ```
2. Build and start the services:
   ```bash
   docker compose up -d --build
   ```
3. Verify the app at:
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:5000/api/health`

### GitHub Actions Vercel + Render pipeline

This repo includes a production deployment workflow in `.github/workflows/production-deploy.yml`.

- On push to `main`, the workflow:
  - installs backend and frontend dependencies
  - runs backend tests
  - builds frontend assets
  - deploys the frontend to Vercel
  - triggers backend deploys on Render

#### Required secrets for automated deployments

- `VERCEL_TOKEN` — Vercel deployment token
- `VERCEL_ORG_ID` — Vercel organization/team ID
- `VERCEL_PROJECT_ID` — Vercel frontend project ID
- `RENDER_API_KEY` — Render API key
- `RENDER_SERVICE_ID` — Render backend service ID

> If any Render secrets are missing, the backend deploy stage is skipped. The frontend deploy still runs when Vercel secrets are present.

## Development Timeline

| Phase | Activities | Duration |
|-------|-----------|----------|
| Planning | Requirements, UI Mockups | 1 Week |
| Design | DB Schema, API Docs | 1 Week |
| Development | Frontend & Backend Coding | 3 Weeks |
| Testing | Unit & Integration Testing | 1 Week |
| Deployment | Cloud Setup, Final Review | 1 Week |

## AI/ML Component

The system uses **Heuristic Rule-Based Algorithms** and **Linear Regression** for:
- Productivity mapping (AM/PM activity analysis)
- Task weighting (difficulty scoring)
- Automatic rescheduling (deadline-based optimization)

## Project Management

We use **GitHub Project Board** (Kanban) to track progress:
- To-Do
- In-Progress
- Done

## Expected Outcomes

- Fully functional URL for task management
- Technical report detailing AI logic and system architecture
- Improved academic workflow for students

## License

MIT License

## Contact

**Enongene Clovis**  
Department of Computer Engineering  
University of Buea  
Email: clovis@example.com

---

Last Updated: May 11, 2026
