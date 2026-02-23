# Matching API Tester (Frontend)

Local Next.js + shadcn/ui dashboard to test the matching backend API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` (or use the default backend URL):
   ```
   NEXT_PUBLIC_API_BASE=http://74.161.162.184:8000
   ```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses the `/proxy` rewrite so requests to the backend avoid CORS.

## Pages

- **Health** — GET /api/health (ES + DB status)
- **Match** — POST /api/match (job → candidates)
- **Job Matches** — GET /api/jobs/:post_id/matches
- **Config** — GET + PATCH /api/config (weights, threshold, max_results)
- **Sync** — POST /api/index/candidates/sync, POST /api/index/jobs/sync
