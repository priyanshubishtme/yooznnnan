# Yojana Sahayak — Production Deployment & Release Guide

This guide details the deployment architecture, containerization, environment variables, and operational procedures for deploying Yojana Sahayak across cloud providers (**Render**, **Vercel**, and **Docker / Self-Hosted VPS**).

---

## 1. Supported Deployment Topologies

Yojana Sahayak supports two proven production deployment topologies:

```
TOPOLOGY A: ALL-IN-ONE CONTAINER (Render / Railway / VPS)
┌────────────────────────────────────────────────────────┐
│ Render / Docker Container                              │
│                                                        │
│  FastAPI Backend (Port 8005 / $PORT)                   │
│   ├── /api/v1/*   -> REST Endpoints                    │
│   ├── /health     -> Health Check Endpoint             │
│   └── /*          -> Precompiled React SPA (dist/)     │
└────────────────────────────────────────────────────────┘

TOPOLOGY B: SPLIT HYBRID (Vercel + Render)
┌───────────────────────────┐      ┌─────────────────────────────┐
│ Vercel Edge Network       │      │ Render Web Service          │
│                           │      │                             │
│ React 19 Frontend (Vite)  │      │ FastAPI Python Backend      │
│  ├── Static UI Pages      │      │  ├── Deterministic Logic    │
│  └── /api/* (Rewrites) ───┼─────►│  ├── SQLite Database        │
│                           │      │  └── Gazette PDFs & Ingest  │
└───────────────────────────┘      └─────────────────────────────┘
```

---

## 2. Option A: Render Deployment (All-in-One Container)

Render is the primary host for the backend and can also serve the full-stack bundle.

### Step 1: Connect Repository
1. Log in to [render.com](https://render.com) using your GitHub account.
2. Click **New +** &rarr; **Web Service**.
3. Select your repository: `priyanshubishtme/yooznnnan`.

### Step 2: Configure Service
* **Name:** `yooznnnan` (or your choice).
* **Region:** **Singapore** or **Frankfurt** (optimal latency for Indian citizens).
* **Runtime:** **Docker** *(Render detects the root `Dockerfile` automatically)*.
* **Instance Type:** Free ($0) or Starter/Basic ($7/mo).

### Step 3: Set Environment Variables
In the **Environment** tab, add:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | Enables production mode |
| `APP_HOST` | `0.0.0.0` | Binds to all network interfaces |
| `APP_PORT` | `8005` | Matches port in `Dockerfile` |
| `PORT` | `8005` | Fallback port mapping for Render router |
| `GROQ_API_KEY` | `gsk_...` | Groq API key for AI Scheme Companion |
| `GROQ_MODEL` | `qwen/qwen3.8-27b` | Recommended fast bilingual model |
| `DATABASE_URL` | `sqlite+aiosqlite:///data/yojana_sahayak.db` | Path to persistent database |
| `ADMIN_SESSION_SECRET` | *(32-character random string)* | Secures admin session cookies |
| `ALLOWED_ORIGINS` | `*` | Allows cross-origin requests from Vercel / frontend |

### Step 4: Health Check
* Under **Advanced**, set **Health Check Path** to `/health`.
* Render checks `https://<your-app>.onrender.com/health` and marks the build **Live** upon receiving `200 OK`.

---

## 3. Option B: Vercel Deployment (Fast Edge Frontend)

To take advantage of Vercel's global CDN without affecting your active Render backend:

### Step 1: Import Project
1. Log in to [vercel.com](https://vercel.com) using GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Select `priyanshubishtme/yooznnnan`.

### Step 2: Configure Build Settings
* **Framework Preset:** **Vite** (auto-detected).
* **Root Directory:** Click **Edit** &rarr; select **`apps/web`**.
* **Build Command:** `npm run build`
* **Output Directory:** `dist`

### Step 3: Automatic API Rewrites
The repository includes [`apps/web/vercel.json`](../apps/web/vercel.json) and root [`vercel.json`](../vercel.json):
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://yooznnnan.onrender.com/api/:path*"
    },
    {
      "source": "/health",
      "destination": "https://yooznnnan.onrender.com/health"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
All API queries from your Vercel URL seamlessly route to your Render backend with zero CORS issues and zero downtime.

---

## 4. Option C: Self-Hosted Docker Compose (VPS / Local)

Deploy on any Linux server (Ubuntu, AWS EC2, DigitalOcean) with Docker:

```bash
# Clone the repository
git clone https://github.com/priyanshubishtme/yooznnnan.git
cd yooznnnan

# Create environment file
cp .env.example .env
# Edit secrets in .env (add your GROQ_API_KEY)

# Start multi-container stack
docker compose up -d --build

# View logs
docker compose logs -f
```

---

## 5. Production Health Monitoring Endpoints

* **Basic Readiness:** `GET /health` &rarr; Returns `{"status": "ok"}`
* **Comprehensive Diagnostic Health:** `GET /api/v1/health` &rarr;
  ```json
  {
    "ok": true,
    "data": {
      "status": "ok",
      "app_name": "Yojana Sahayak",
      "version": "1.0.0",
      "environment": "production",
      "database_connected": true,
      "components": {
        "database": { "status": "healthy", "message": "Connected" },
        "storage": { "status": "healthy", "message": "Data directory verified at data" },
        "scheduler": { "status": "healthy", "message": "Mode: dedicated_single_instance" }
      }
    }
  }
  ```
