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

## Deploy to Render

This frontend is automatically provisioned when deploying the project via **Render Blueprint** (`render.yaml`).

### Deploying with Render Blueprint
1. Connect your repository in [Render Dashboard](https://dashboard.render.com/blueprints).
2. Select **New Blueprint Instance**.
3. Render reads `render.yaml` and spins up both:
   - `beema-api` (FastAPI backend web service)
   - `beema-portal` (Vite React static site)
4. The blueprint automatically links `VITE_API_BASE_URL` from `beema-api` to `beema-portal`.
