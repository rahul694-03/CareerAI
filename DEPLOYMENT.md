# 🚀 CareerAI Cloud Deployment Guide

This guide walks you through deploying the complete CareerAI stack (PostgreSQL database, Spring Boot Java backend, and React/Vite frontend) to cloud platforms like **Render**, **Railway**, **Fly.io**, **Vercel**, or **Docker Compose (Self-hosted/VPS)**.

---

## 📋 Environment Variables Reference

### Backend Service (`backend`)
| Variable | Description | Example / Recommended |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Spring Boot | `8080` (auto-set by Render/Railway/Fly.io) |
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://host:5432/careerai` or standard `postgres://user:pass@host:5432/careerai` *(automatically parsed by CareerAI)* |
| `DATABASE_USERNAME` | PostgreSQL username | `postgres` |
| `DATABASE_PASSWORD` | PostgreSQL password | *(your secret db password)* |
| `JWT_SECRET` | 256-bit secret key for signing JWT tokens | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970337336763979244226452948404D6351` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs | `https://your-frontend.vercel.app,https://your-app.onrender.com` |

### Frontend Service (`frontend`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Full public URL of your deployed backend API | `https://careerai-backend.onrender.com` |

---

## Option 1: 1-Click Blueprint Deployment on Render (Recommended)

Render provides a free tier and supports blueprints that automatically provision PostgreSQL, the Spring Boot Docker container, and the React static site.

### Steps:
1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: add cloud deployment and docker configurations"
   git push origin main
   ```
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository (`CareerAI`).
5. Render will automatically detect [`render.yaml`](./render.yaml) and provision:
   - **Database**: Managed PostgreSQL instance (`careerai-db`)
   - **Backend Web Service**: Spring Boot API built via [`backend/Dockerfile`](./backend/Dockerfile)
   - **Frontend Static Site**: React Vite app served globally via CDN with SPA rewrite rules
6. Click **Apply**. Render will build and deploy the entire stack automatically.

---

## Option 2: Railway Deployment

Railway offers fast builds and native PostgreSQL plugins.

### Steps:
1. Log in to [Railway](https://railway.app).
2. Click **New Project** > **Provision PostgreSQL**.
3. In the same project, click **New** > **GitHub Repo** > Select `CareerAI`:
   - Set **Root Directory** to `backend`.
   - Railway will detect `backend/Dockerfile` and begin building.
   - Go to **Variables** and link:
     - `DATABASE_URL` -> `${{Postgres.DATABASE_URL}}`
     - `JWT_SECRET` -> Generate a random 64-char string.
     - `CORS_ALLOWED_ORIGINS` -> Add your frontend URL (e.g., `https://*.railway.app,https://*.vercel.app`).
4. To add the frontend:
   - Click **New** > **GitHub Repo** > Select `CareerAI`.
   - Set **Root Directory** to `frontend`.
   - Set build command: `npm install && npm run build`
   - Set output directory: `dist`
   - Set environment variable: `VITE_API_BASE_URL` = `https://<your-backend-railway-url>`

---

## Option 3: Split Deployment (Frontend on Vercel + Backend on Render/Railway)

Many developers prefer hosting the frontend on Vercel for instant CDN deployments while running Spring Boot on Render or Railway.

### Step 1: Deploy Backend on Render or Railway
Follow the steps in Option 1 or 2 to get your backend running. Note down your backend URL (e.g. `https://careerai-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New...** > **Project**.
2. Import your GitHub repository (`CareerAI`).
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Environment Variables**:
     - Key: `VITE_API_BASE_URL`
     - Value: `https://careerai-backend.onrender.com` (your backend URL)
4. Click **Deploy**.
5. Once deployed, add your Vercel URL to the backend's `CORS_ALLOWED_ORIGINS` environment variable.

---

## Option 4: Self-Hosting with Docker Compose (VPS / Local Server / Cloud VM)

You can run the entire stack on any Linux/Windows server with Docker and Docker Compose installed:

```bash
# Clone the repository on your server
git clone https://github.com/rahul694-03/CareerAI.git
cd CareerAI

# Build and start all 3 services (PostgreSQL, Backend, Frontend) in detached mode
docker compose up --build -d

# Check running status
docker compose ps

# View live backend logs
docker compose logs -f backend
```

Once started:
- **Frontend SPA**: `http://<your-server-ip>:80` (or `:3000`)
- **Backend API**: `http://<your-server-ip>:8080/api`
- **PostgreSQL**: `localhost:5432`

---

## 🔍 Verification & Health Check

After deployment, test the health check endpoint:
```bash
curl https://<your-backend-url>/api/jobs/providers/status
```
Expected response:
```json
{
  "totalJobs": 1770,
  "sources": {
    "OFFICIAL_COMPANY": "ACTIVE",
    "LINKEDIN": "ACTIVE",
    "INDEED": "ACTIVE",
    "NAUKRI": "ACTIVE"
  }
}
```
