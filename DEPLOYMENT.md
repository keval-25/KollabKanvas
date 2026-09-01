# KollabKanvas Deployment & Production Guide

This guide provides step-by-step instructions for deploying **KollabKanvas** using **Docker containers** on **Render** (backend & message services) and **Vercel** (frontend SPA), as well as local single-command deployment via **Docker Compose**.

---

## Architecture Overview

```
                      +-------------------+
                      |   Vercel (CDN)    |
                      |   React SPA       |
                      +---------+---------+
                                |
                   HTTPS REST   |  WSS WebSockets
                                v
                      +-------------------+
                      |   Render Cloud    |
                      |   Nginx Gateway   |
                      +----+---------+----+
                           |         |
                           v         v
                     +---------+ +---------+
                     | Backend | | Backend |  (Horizontally Scaled)
                     +----+----+ +----+----+
                          |           |
             +------------+-----------+------------+
             |            |                        |
             v            v                        v
      +------------+ +----------+         +-----------------+
      | Mongo Atlas| | Redis    |         | External AI     |
      | Database   | | Pub/Sub  |         | & Cloudinary    |
      +------------+ +----------+         +-----------------+
```

---

## 1. Deploying Backend to Render (Docker Web Service)

Render natively supports deploying Docker container images via Git or Docker Registry (GHCR/Docker Hub).

### Step 1.1: Database & Cache Prerequisites
1. **MongoDB Atlas:** Create a free or paid MongoDB Atlas Cluster.
   - Obtain the connection URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/kanvas?retryWrites=true&w=majority`).
2. **Render Redis / Upstash Redis:**
   - Create a Redis instance on Render or Upstash.
   - Note the Redis host, port, and password.

### Step 1.2: Create Render Web Service for Backend
1. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> Select **Web Service**.
2. Connect your GitHub repository `KollabKanvas`.
3. Configure settings:
   - **Name:** `kollabkanvas-backend`
   - **Environment:** `Docker`
   - **Region:** Choose nearest region (e.g., Oregon / Frankfurt / Singapore)
   - **Branch:** `main`
   - **Dockerfile Path:** `./backend/Dockerfile`
   - **Docker Context:** `./backend`
4. Configure Environment Variables under **Environment**:
   | Variable | Example / Value | Description |
   |---|---|---|
   | `SPRING_PROFILES_ACTIVE` | `docker` | Docker Spring profile |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB connection URI |
   | `REDIS_HOST` | `redis-xxxx.render.com` | Redis host |
   | `REDIS_PORT` | `6379` | Redis port |
   | `REDIS_PASSWORD` | `<your-redis-password>` | Redis password |
   | `JWT_SECRET` | `<random-64-char-string>` | JWT signing key |
   | `AI_API_KEY` | `sk-ant-...` | Anthropic / OpenAI API Key |
   | `CLOUDINARY_CLOUD_NAME` | `kanvas-cloud` | Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | `123456789` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET` | `secret` | Cloudinary API Secret |

5. Click **Create Web Service**. Render will execute the multi-stage `backend/Dockerfile`, run compilation tests, and launch the Spring Boot application on port 8080.

---

## 2. Deploying Frontend to Vercel

Vercel provides edge CDN hosting optimized for React Vite single-page applications.

### Step 2.1: Import Repository to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/) -> Click **Add New...** -> Select **Project**.
2. Select repository `keval-25/KollabKanvas`.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2.2: Configure Environment Variables
Under **Environment Variables**, add:
| Variable | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://kollabkanvas-backend.onrender.com/api/v1` | Render Backend REST Base URL |
| `VITE_WS_URL` | `wss://kollabkanvas-backend.onrender.com/ws` | Render Backend WebSocket URL |

### Step 2.3: Configure SPA Routing Rewrite (`vercel.json`)
Ensure `frontend/vercel.json` exists for single-page routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

4. Click **Deploy**. Vercel will build the frontend SPA and issue a production HTTPS URL (e.g., `https://kollabkanvas.vercel.app`).

---

## 3. Local Single-Command Deployment (Docker Compose)

For local staging or self-hosted single-VM deployments (AWS EC2 / DigitalOcean Droplet / Hetzner):

### Step 3.1: Start Stack
Ensure Docker Engine and Docker Compose are installed:
```bash
docker-compose up -d --build
```

### Step 3.2: Verify Container Services
```bash
docker-compose ps
```
Services spun up:
- `frontend` (Port 3000 -> 80)
- `backend` (Port 8080 -> 8080)
- `mongo` (Port 27017 -> 27017)
- `redis` (Port 6379 -> 6379)
- `nginx` (Port 80 -> 80)

Access points:
- **Application UI:** `http://localhost`
- **REST API:** `http://localhost/api/v1/auth/me`
- **Health Endpoint:** `http://localhost/actuator/health`

---

## 4. Verification Checklist

- [x] JWT Authentication & Token Refresh on `/api/v1/auth/*`
- [x] Board CRUD & Template Initialization
- [x] STOMP WebSocket Live Drawing & Cursor Broadcasting on `/ws`
- [x] Server-Side RBAC Enforcement on REST & WebSocket frames
- [x] AI Board Summarization with Snapshot Version Caching
- [x] Append-Only User Transcripts with CSV Export
- [x] Signed Cloudinary Media Uploads & Canvas Image/PDF Export
- [x] Dockerization & Render/Vercel Cloud Deployment Setup
