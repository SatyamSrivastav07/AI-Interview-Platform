# Deployment Guide

This guide covers a production deployment using MongoDB Atlas for the database, Render for the backend API, and Vercel for the React frontend.

Do not commit real secrets. Add production values only in the hosting provider environment variable dashboards.

## 1. MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Add the Render outbound IP addresses to Network Access, or temporarily allow access from `0.0.0.0/0` if you accept that tradeoff.
4. Copy the connection string.
5. Replace placeholders in the URI with the database username, password, and database name.

Example shape:

```text
mongodb+srv://<user>:<password>@<cluster-url>/ai-interview-platform?retryWrites=true&w=majority
```

## 2. Render Backend

Create a new Render Web Service connected to this repository.

Recommended settings:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Backend environment variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | No | Render injects a port automatically. Keep unset unless needed. |
| `MONGO_URI` | Yes | MongoDB Atlas connection string. |
| `JWT_SECRET` | Yes | Long random secret. Never commit it. |
| `JWT_EXPIRES_IN` | Yes | Example: `7d`. |
| `CLIENT_URL` | Yes | Vercel frontend origin, without a trailing slash. |
| `GEMINI_API_KEY` | Yes | Google Gemini API key. |

After deploy, verify:

```text
https://your-backend.onrender.com/api/health
```

## 3. Vercel Frontend

Create a new Vercel project connected to this repository.

Recommended settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Frontend environment variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Render backend API URL ending in `/api`, for example `https://your-backend.onrender.com/api`. |

The frontend intentionally fails fast when `VITE_API_URL` is missing so production does not silently call a local API.

## 4. Connect Frontend And Backend

1. Deploy the backend on Render.
2. Copy the Render backend URL.
3. In Vercel, set `VITE_API_URL` to `https://your-backend.onrender.com/api`.
4. Deploy the frontend on Vercel.
5. Copy the Vercel frontend URL.
6. In Render, set `CLIENT_URL` to the Vercel frontend origin, for example `https://your-app.vercel.app`.
7. Redeploy the Render backend after changing `CLIENT_URL`.

## 5. Common Deployment Errors

### CORS error in browser

Check that Render `CLIENT_URL` exactly matches the Vercel origin. Do not include a trailing slash.

### Frontend crashes on load

Check that Vercel has `VITE_API_URL` set. It must include `/api`.

### API health check works but login fails

Check `JWT_SECRET`, `JWT_EXPIRES_IN`, and MongoDB connectivity.

### Render deploy starts but database connection fails

Check `MONGO_URI`, database username/password, and Atlas Network Access rules.

### AI resume or interview features fail

Check `GEMINI_API_KEY` in Render. The backend needs this key for AI parsing, question generation, and answer evaluation.

### File uploads fail

Render local disk storage is ephemeral. Uploaded files may not persist across restarts. The app stores parsed resume data in MongoDB, but production file storage should eventually move to cloud object storage.

## 6. Production Checklist

- `server` deploys with `npm start`.
- Backend `/api/health` returns success.
- `CLIENT_URL` points to the Vercel frontend.
- `VITE_API_URL` points to the Render backend `/api` URL.
- MongoDB Atlas connection works.
- Gemini API key is configured.
- No real secrets are committed.
