# Running Eidolon locally (after a break)

## The easy way — one click
Double-click **`start-dev.bat`** in the project root.

It opens three windows and starts everything:
- **API server** → http://localhost:4000
- **Web client** → http://localhost:5173
- **Stripe webhook listener** → forwards payments to the server

Leave all three windows open while you use the app. Close them to stop.

> First time after installing the Stripe CLI: if the Stripe window says
> `stripe is not recognized`, open a brand-new terminal (or reboot once) so
> Windows picks up the updated PATH, then run `start-dev.bat` again.

## What makes it reliable across restarts

### Stripe
- The listener authenticates with `STRIPE_SECRET_KEY` from `server/.env`, so you
  **never need `stripe login`**, and the **webhook signing secret stays the same
  every time** — it already matches `STRIPE_WEBHOOK_SECRET` in `server/.env`.
- Purchases only fulfill (game lands in your Library) while the Stripe window is
  running. If you buy something and it doesn't appear, that window isn't open.
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

### MongoDB Atlas (free tier can be flaky)
- The Prisma client now **auto-retries transient connection blips** (up to 4
  attempts with backoff), so a momentary Atlas hiccup recovers silently instead
  of erroring.
- The `/api/health` check also retries before reporting the DB as down.
- `server/.env` uses the **direct (non-SRV) connection string** — more reliable
  on networks where the `mongodb+srv` DNS lookup fails. (The SRV form is kept
  commented for deployment hosts.)
- If Atlas is ever fully unreachable, it's almost always a network issue: make
  sure your IP is allowed in Atlas → Network Access (`0.0.0.0/0` for dev) and
  that the cluster isn't paused.

## Manual start (if you prefer separate terminals)
```bash
# terminal 1
cd server && npm run dev
# terminal 2
cd client && npm run dev
# terminal 3
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```
