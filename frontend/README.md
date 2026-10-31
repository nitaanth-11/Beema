# Beema Frontend - Policyholder & Underwriter Portal

The interactive React + Vite frontend for **Beema - AI-Powered Insurance Claims Investigation System**.

## Features
- **Visual Claim Intake & Forensic Assessment**: Damage scoring, storm vs. tool trauma detection, and photo fraud screening.
- **LAYA Decision Engine Dashboard**: Real-time policyholder persona simulation and automated payout estimation.
- **Offline Demo Mode**: Automatically operates with mock data if the backend FastAPI service is unreachable.

---

## Local Development

```bash
cd frontend
npm install
npm run dev
```

The portal runs by default at `http://localhost:5173`.

---

## Deploy to Vercel

### Option 1: Automatic Root Deployment (Recommended)
1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Keep **Root Directory** as `./` (the root `vercel.json` configures the build and SPA client routing automatically).
4. (Optional) In **Environment Variables**, set:
   - `VITE_API_URL`: Your live FastAPI backend endpoint. If not provided, the frontend seamlessly operates in full offline mock demo mode.
5. Click **Deploy**.

### Option 2: Deploy from `frontend/` Subdirectory
1. In Vercel Project Settings, set **Root Directory** to `frontend`.
2. Vercel will automatically detect **Vite** and use `frontend/vercel.json` for SPA route rewrites.
3. Click **Deploy**.

### Option 3: Deploy via Vercel CLI
```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```
