# Deployment Guide - PRIVATE DOCS AI

**Author & Maintainer:** Yashpreet Singh Gujral  
**GitHub:** [@gyashpreetsingh-ux](https://github.com/gyashpreetsingh-ux)

This guide covers step-by-step instructions for deploying Private Docs AI to production cloud environments.

---

## Option 1: One-Click Deploy on Render (Recommended & Beginner-Friendly)

Render provides free hosting for both web services and static sites, and supports persistent storage disks.

### Steps:
1. **Push to GitHub**:
   Ensure your repository is pushed to `https://github.com/gyashpreetsingh-ux/private-docs-ai`.

2. **Connect to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** -> **Blueprint**.
   - Connect your GitHub account and select the `private-docs-ai` repository.
   - Render will automatically detect `render.yaml` and configure both the backend web service and the frontend static site!

3. **Configure Environment Variables**:
   In your Render Backend service settings, add your AI provider keys (if using cloud AI):
   - `AI_PROVIDER`: `openai` | `gemini` | `fallback`
   - `OPENAI_API_KEY`: `your-key` (if using OpenAI)
   - `GEMINI_API_KEY`: `your-key` (if using Gemini)
   - `CORS_ORIGINS`: `https://your-frontend-app.onrender.com`

---

## Option 2: Frontend on Vercel + Backend on Render / Railway

For the fastest global CDN performance for your React frontend:

### 1. Deploy Frontend on Vercel:
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New** -> **Project**.
3. Import `private-docs-ai`.
4. In the Project Configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### 2. Connect Frontend to Backend:
Set an environment variable in Vercel:
- `VITE_API_URL`: `https://your-backend.onrender.com`

---

## Option 3: Dockerized VPS Deployment (Ubuntu / AWS / DigitalOcean)

If you have an Ubuntu server or VPS:

### 1. Install Docker & Docker Compose:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

### 2. Clone & Launch:
```bash
git clone https://github.com/gyashpreetsingh-ux/private-docs-ai.git
cd private-docs-ai
cp .env.example .env
# Edit .env with your domain or API keys
nano .env

# Build and start services in the background:
docker compose up --build -d
```

### 3. Verification:
- Frontend: `http://<your-server-ip>:5174`
- Backend API: `http://<your-server-ip>:8000`
- API Health: `http://<your-server-ip>:8000/health`
