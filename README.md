<div align="center">
  <img src="./edilon%20logo.png" alt="Eidolon" width="120" />

  # Eidolon

  **A premium, full-stack PC game store** ,cinematic dark UI with Apple-style liquid-glass
  effects, a scroll-driven onboarding journey, Stripe checkout & subscriptions, an AI shopping
  assistant, and a full admin dashboard.

  <sub>React 19 · Vite · TypeScript · Tailwind CSS v4 · Node · Express · Prisma · MongoDB · Stripe · Google Gemini</sub>
</div>

---

## ✨ Features

**Storefront**
- Cinematic, auto-rotating hero and **sliding banner carousels**
- Home feed of real categories (New Releases, Top Rated, per-genre rows, Best Value) - all live data
- **Browse by genre** tiles backed by real cover art
- Full catalog with search, genre/platform/price filters, sorting and pagination
- Rich game detail pages with screenshots, trailers, system requirements and reviews
- A custom **liquid-glass cursor lens** that refracts the UI beneath it

**Accounts & commerce**
- JWT auth (access + refresh) with a scroll-driven **onboarding** flow for new users
- Cart, **Stripe Checkout** (one-time purchases *and* monthly subscriptions)
- Library, wishlist, order history and billing
- Avatar upload, profile editing
- Star ratings & reviews with helpful-votes

**AI & admin**
- **AI shopping assistant** (Google Gemini) that recommends games and can add to cart / start checkout
- Admin dashboard: manage games (with image uploads), view users and revenue analytics
- Game catalog auto-synced from the **RAWG** API on a schedule

---

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, framer-motion, GSAP, Lenis, Zustand, TanStack Query, React Hook Form + Zod |
| **Backend** | Node, Express, TypeScript, Prisma ORM, JWT, Multer, node-cron |
| **Database** | MongoDB (Atlas) |
| **Payments** | Stripe (Checkout, subscriptions, webhooks) |
| **AI** | Google Gemini |
| **Data source** | RAWG video-games API |

---

## 📁 Project structure

```
.
├── client/                 # React + Vite front-end
│   ├── public/             # favicon, logo, static assets
│   └── src/
│       ├── components/     # UI (nav, home, games, cart, chat, admin, ui…)
│       ├── pages/          # routes (Home, Games, Detail, Onboarding, Profile, Admin…)
│       ├── hooks/          # queries, mutations, utilities
│       ├── store/          # Zustand stores (auth, cart, chat)
│       └── lib/            # api client, validation, helpers
├── server/                 # Express + Prisma API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/  controllers/  services/  middleware/  lib/  validators/
│       ├── cron/           # scheduled RAWG sync
│       └── scripts/        # one-off maintenance scripts
├── README.md · DATABASE.md · DEPLOYMENT.md · RUN-LOCAL.md
└── start-dev.bat           # one-click local startup (Windows)
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 20+**
- A free **MongoDB Atlas** cluster — https://www.mongodb.com/atlas
- A **Stripe** account (test mode is fine) - https://dashboard.stripe.com
- A **RAWG** API key (free) — https://rawg.io/apidocs
- A **Google Gemini** API key (free tier) - https://aistudio.google.com/apikey
- *(optional)* the **Stripe CLI** for local webhooks - https://stripe.com/docs/stripe-cli

### 1. Install
```bash
git clone https://github.com/daniyaluh/eidolon.git
cd eidolon
cd server && npm install
cd ../client && npm install
```

### 2. Configure credentials
Secrets are **never committed** - each app ships a `.env.example`. Copy it to a real `.env`
and paste your own keys.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Atlas → **Connect → Drivers** → copy the `mongodb+srv://…` string; add your DB user/password and a database name (e.g. `/eidolon`). |
| `STRIPE_SECRET_KEY` | Stripe → **Developers → API keys** → *Secret key* (`sk_test_…`). |
| `STRIPE_WEBHOOK_SECRET` | Run `stripe listen --forward-to localhost:4000/api/webhooks/stripe` → it prints a `whsec_…`. |
| `RAWG_API_KEY` | rawg.io/apidocs. |
| `GEMINI_API_KEY` | aistudio.google.com/apikey. |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Any long random strings, e.g. `openssl rand -base64 48`. |

**`client/.env`**

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000/api` for local dev. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe → **API keys** → *Publishable key* (`pk_test_…`); safe to expose in the browser. |

### 3. Set up the database
```bash
cd server
npm run prisma:generate   # generate the Prisma client
npm run prisma:push       # create collections/indexes in your Atlas DB
npm run sync:games        # (optional) pull the game catalog from RAWG
```

### 4. Run
**One click (Windows):** double-click `start-dev.bat` - opens the API, web client and Stripe listener.

**Manual:**
```bash
# terminal 1 — API  → http://localhost:4000
cd server && npm run dev
# terminal 2 — web  → http://localhost:5173
cd client && npm run dev
# terminal 3 — Stripe webhooks (needed for purchases to fulfill locally)
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Open **http://localhost:5173**. Test card: `4242 4242 4242 4242`, any future expiry any CVC.

> **First admin:** register an account, then set its `role` to `ADMIN` in your database
> (Atlas UI or a small Prisma script). Admins get the **Admin** dashboard link in the navbar.

---

## 📜 Scripts

**Server** (`/server`)
| Script | Does |
|---|---|
| `npm run dev` | Start the API in watch mode |
| `npm run build` | Prisma generate + compile TypeScript |
| `npm start` | Run the compiled server |
| `npm run prisma:push` | Push the schema to MongoDB |
| `npm run sync:games` | Sync games from RAWG |

**Client** (`/client`)
| Script | Does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## ☁️ Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md). In short: deploy the **server** to a Node host (Render/Railway/etc.),
the **client** to a static host (Vercel/Netlify), point `VITE_API_BASE_URL` at the server, set
`CLIENT_ORIGIN` on the server to the client URL, and create a Stripe webhook endpoint for
`/api/webhooks/stripe`. Swap the storage driver to S3/R2 for persistent uploads.

More docs: [`RUN-LOCAL.md`](./RUN-LOCAL.md) · [`DATABASE.md`](./DATABASE.md)

---

## 🔒 Security

Real secrets live **only** in `.env` files, which are gitignored - never commit them.
If a key is ever exposed, rotate it in the provider's dashboard.

---

<div align="center"><sub>Made by Daniyaluh with ❤️ — Eidolon</sub></div>
