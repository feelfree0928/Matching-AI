# Frontend → Backend Connection Troubleshooting

## Symptom: 500 Internal Server Error + ETIMEDOUT, backend shows no request logs

### What’s happening

1. **Browser** requests `http://localhost:3000/proxy/api/health` (same origin).
2. **Next.js** receives it and runs the rewrite: proxy to `NEXT_PUBLIC_API_BASE` (e.g. `http://74.161.162.184:8000/api/health`).
3. **Next.js (on your PC)** opens a **new outbound TCP connection** from your PC to the VPS `74.161.162.184:8000`.
4. That connection **times out** (ETIMEDOUT) — it never completes.
5. Next.js returns **500** to the browser because the proxy request failed.
6. **Backend on the VPS never sees the request** — so you get no Uvicorn access logs.

So: the 500 and “no log on backend” both come from the same cause — **the proxy connection from your machine to the VPS never reaches the backend**.

### Why the connection times out

The TCP handshake (SYN → SYN-ACK → ACK) never completes. Common causes:

| Cause | Where | What to do |
|-------|--------|------------|
| **Port 8000 not open (inbound)** | VPS host firewall (e.g. `ufw`) | Open 8000: `sudo ufw allow 8000/tcp && sudo ufw reload` |
| **Port 8000 not open** | Cloud firewall / security group (AWS, DO, Linode, etc.) | Add inbound rule: TCP 8000 from 0.0.0.0/0 (or your IP) |
| **Wrong IP or backend down** | VPS | Confirm backend is up and IP is correct; test with `curl` from VPS and from your PC |
| **Network blocks outbound** | Your PC / ISP / corporate | Try from another network or use local backend (see below) |

### Fix checklist (on the VPS)

Run these **on the Ubuntu VPS**:

```bash
# 1. Backend is listening on all interfaces
ss -tlnp | grep 8000
# Expect: *:8000 or 0.0.0.0:8000

# 2. From the VPS, local request works
curl -s http://127.0.0.1:8000/api/health

# 3. Check host firewall
sudo ufw status
# If 8000 is not listed, open it:
sudo ufw allow 8000/tcp
sudo ufw reload
```

Then **from your Windows PC** (PowerShell):

```powershell
# 4. Can your PC reach the VPS on 8000?
curl http://74.161.162.184:8000/api/health
# If this times out, the problem is network/firewall (VPS or cloud), not the frontend.
```

If step 4 times out, open **TCP port 8000** in your **cloud provider’s firewall/security group** for the VPS (inbound from 0.0.0.0/0 or your IP).

### Workaround: use a local backend while developing

If you don’t need to hit the VPS from your PC (e.g. you’re developing the frontend and can run the API locally):

1. On your PC, run the FastAPI app (e.g. from `seniorsatwork-matching`):
   ```bash
   uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
   ```
2. In `frontend/.env.local` (or `.env`), set:
   ```env
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
   ```
3. Restart the Next.js dev server (`npm run dev`).

Then the proxy will target your local backend and you won’t depend on the VPS being reachable from your PC.
