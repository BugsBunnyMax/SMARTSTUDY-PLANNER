# Deployment Guide

This document explains how to deploy SmartStudy Planner locally (Docker Compose) and to managed platforms (Vercel for frontend, Render for backend), and lists required environment variables and GitHub Actions secrets.

## 1. Local production-like deployment (Docker Compose)

1. Copy environment template and set secrets in project root:

```bash
cp .env.example .env
# Edit .env: set JWT_SECRET, MONGO_URI (or leave Docker's mongodb), REACT_APP_API_URL
```

2. Build and start services:

```bash
docker compose up -d --build
```

3. Check services and logs:

```bash
docker compose ps
docker compose logs -f backend
curl http://localhost:5000/api/health
```

4. Tear down:

```bash
docker compose down -v
```

**Notes:**
- The `docker-compose.yml` contains example credentials for local development. Change them before using in any public or shared environment.

## 2. Managed deployment: Vercel (frontend) + Render (backend)

The repository includes a GitHub Actions workflow (`.github/workflows/production-deploy.yml`) that will deploy automatically when pushing to `main`, provided the required secrets are configured.

### Required GitHub Actions secrets
- `VERCEL_TOKEN` — Vercel personal token
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID for the frontend
- `RENDER_API_KEY` — Render API key
- `RENDER_SERVICE_ID` — Render service ID for the backend

### Backend environment variables (set in Render dashboard)
- `MONGO_URI` — MongoDB connection string (Atlas recommended)
- `JWT_SECRET` — Strong production secret
- `NODE_ENV=production`
- Optional: `SENTRY_DSN`, `SMTP_*` for email

### Frontend environment
- `REACT_APP_API_URL` — Backend API URL (e.g. `https://api.example.com`)

### Steps
1. Create projects on Vercel and Render and note the IDs and tokens.
2. Add the secrets to GitHub: `Settings → Secrets and variables → Actions`.
3. Set the backend env vars in Render service settings (use the Render UI).
4. Merge code to `main` — the workflow will build, run tests, and deploy.

## 3. Container registry + orchestrator

If you prefer to run containers yourself (Kubernetes, ECS, Nomad), build and push images to a registry (example: GitHub Container Registry):

```bash
# Build and push (example)
docker build -t ghcr.io/<owner>/smartstudy-backend:latest -f backend/Dockerfile backend
docker push ghcr.io/<owner>/smartstudy-backend:latest

docker build -t ghcr.io/<owner>/smartstudy-frontend:latest -f frontend/Dockerfile frontend
docker push ghcr.io/<owner>/smartstudy-frontend:latest
```

Add a CI workflow to build and push images and then deploy to your cluster.

## 4. Verification & healthchecks
- Backend health endpoint: `GET /api/health` (verify after deployment).
- Frontend: open the Vercel or host URL.
- Monitor logs on Render, Vercel or your cluster.

## 5. Security & production hardening
- Use a strong `JWT_SECRET` (>=32 chars).
- Do not commit `.env` files. Use platform secrets.
- Enable HTTPS (Vercel/Render provide TLS by default).
- Configure MongoDB backups and IP restrictions (Atlas).
- Enable Dependabot and CodeQL scans in GitHub.

---

If you want, I can:
- Add a GitHub Actions step to push docker images to GHCR and deploy to a Kubernetes cluster, or
- Trigger local `docker compose up` now (if you want me to run it here).