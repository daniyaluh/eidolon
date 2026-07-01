# Eidolon — Deployment Guide

This is a two-part app:

- **`/server`** — Node.js + Express + TypeScript API (Prisma + **MongoDB Atlas**, Redis, Stripe, RAWG, Anthropic).
- **`/client`** — React + Vite static site.

> **Database note:** Although the env var is named `DATABASE_URL`, this project uses **MongoDB Atlas** via Prisma's MongoDB connector — *not* Postgres. Where a host offers a "managed Postgres" add-on, use **MongoDB Atlas** (free M0 tier works) instead and point `DATABASE_URL` at the Atlas connection string. The Redis add-on is used as-is.

---

## 1. Provision the data stores

### MongoDB Atlas (database)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access (`0.0.0.0/0` for hosted servers, or the host's egress IPs).
3. Copy the connection string and add the DB name: `…mongodb.net/gamehub?retryWrites=true&w=majority` → this is `DATABASE_URL`.

### Redis (cache)
- Use your host's Redis add-on (Render Key Value / Railway Redis) **or** a free [Upstash](https://upstash.com) instance. The TCP URL → `REDIS_URL`.
- Redis is optional: caching no-ops if `REDIS_URL` is unset, but production should set it.

---

## 2. Deploy the server (Render or Railway)

Both hosts deploy from the repo with the **root directory set to `/server`**.

| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |

`npm run build` runs `prisma generate && tsc`; `npm start` runs `node dist/index.js`.

### Environment variables (server)
Set all of these in the host's dashboard (see [`server/.env.example`](server/.env.example)):

```
DATABASE_URL            # MongoDB Atlas connection string
REDIS_URL               # Redis add-on / Upstash URL
JWT_SECRET              # openssl rand -base64 48
JWT_REFRESH_SECRET      # openssl rand -base64 48
STRIPE_SECRET_KEY       # sk_live_… (or sk_test_… while testing)
STRIPE_WEBHOOK_SECRET   # from the Stripe webhook you create in step 4
RAWG_API_KEY
ANTHROPIC_API_KEY
CLIENT_ORIGIN           # your deployed client URL, e.g. https://gamehub.vercel.app
SERVER_PUBLIC_URL       # this server's URL, e.g. https://gamehub-api.onrender.com
NODE_ENV=production
PORT                    # Render/Railway inject this automatically
```

### Sync the schema and seed games
After the first deploy, run once from the host's shell (or locally with the prod `DATABASE_URL`):

```bash
npm run db:deploy   # pushes the Prisma schema to MongoDB (prisma db push)
npm run sync:games  # pulls the initial RAWG catalog (needs RAWG_API_KEY)
```

The RAWG sync also runs automatically every 12 hours via the built-in cron.

### Render specifics
- New → **Web Service** → point at the repo, root dir `server`.
- Add a **Key Value (Redis)** instance and copy its internal URL to `REDIS_URL`.
- Set the health check path to `/api/health` so Render restarts unhealthy instances.

### Railway specifics
- New Project → Deploy from repo; set the service root to `server`.
- Add the **Redis** plugin; reference its `REDIS_URL` variable.
- Railway sets `PORT` automatically.

---

## 3. Deploy the client (Vercel or Netlify)

Deploy with the **root/base directory set to `/client`**.

| Setting | Value |
|---|---|
| Root / base directory | `client` |
| Build command | `npm run build` |
| Output directory | `dist` |

### Environment variables (client)
See [`client/.env.example`](client/.env.example):

```
VITE_API_BASE_URL=https://gamehub-api.onrender.com/api   # your server URL + /api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…                     # or pk_test_…
```

> Vite inlines `VITE_*` vars at **build time** — set them before building, and rebuild after changing them.

### SPA routing
This is a client-side-routed SPA, so all paths must serve `index.html`:

- **Vercel** — auto-detected for Vite; if needed add a rewrite of `/(.*)` → `/index.html`.
- **Netlify** — add `client/public/_redirects` containing:
  ```
  /*  /index.html  200
  ```

### After the client is live
Set the server's `CLIENT_ORIGIN` to the client URL (for CORS + cookies) and redeploy the server.

---

## 4. Register the Stripe webhook

1. In the [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR-SERVER-URL/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the endpoint's **Signing secret** (`whsec_…`) into the server's `STRIPE_WEBHOOK_SECRET`, then redeploy.

> The webhook route is mounted before the JSON body parser so Stripe's signature verification gets the raw body — no extra config needed.

**Local testing:** `stripe listen --forward-to localhost:4000/api/webhooks/stripe` prints a temporary `whsec_…` for dev.

---

## 5. Post-deploy checklist

- [ ] `GET https://YOUR-SERVER-URL/api/health` returns `{"status":"ok","checks":{"database":"ok","redis":"ok"}}`.
- [ ] Client loads and the games grid populates (run `sync:games` if empty).
- [ ] Register / log in works (cookies set; `CLIENT_ORIGIN` matches the client URL).
- [ ] A test Stripe checkout completes and the webhook fulfills the order (check the game appears in the library).
- [ ] Rate limiting active: rapid repeated `/api/auth/login` calls return `429` in production.
