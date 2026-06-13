# Automated Donations Setup (All Motion Sports)

This project uses a **static HTML site** with **Vercel Serverless Functions** and **Vercel KV** for real-time fundraising. This is the same backend pattern as Next.js API routes on Vercel—no manual number updates required.

---

## What was added

| Path | Purpose |
|------|---------|
| `index.html` → `#donate` | Donation section UI |
| `donations.js` | Fetches live stats every 20 seconds |
| `api/donations/stats.js` | Public API: raised, goal, %, donors |
| `api/webhooks/stripe.js` | Stripe webhook: auto-updates totals |
| `lib/donation-store.js` | KV read/write logic |
| `lib/donation-config.js` | Goal ($10,000) and milestones |

**Stripe donation link:**  
https://donate.stripe.com/7sY4gB3IzcqW5CK6bY0Fi08

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Create Vercel KV database

1. Open [Vercel Dashboard](https://vercel.com) → your project  
2. Go to **Storage** → **Create Database** → **KV**  
3. Connect it to your project  
4. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically  

---

## Step 3 — Add Stripe environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Where to find it |
|----------|------------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Created in Step 4 |
| `DONATION_GOAL_DOLLARS` | Optional, default `10000` |

Copy `.env.example` locally if you use `vercel dev`.

---

## Step 4 — Create Stripe webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**  
2. **Endpoint URL:**  
   `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe`  
3. **Events to send:**  
   - `checkout.session.completed`  
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET` in Vercel  
5. Redeploy the project  

When someone completes a donation via your Stripe Payment Link, Stripe calls the webhook → totals and donor count update in KV → the progress bar updates on the next poll (within ~20 seconds).

---

## Step 5 — Deploy

```bash
git add .
git commit -m "Add automated donation fundraising section"
git push
```

Or deploy with the Vercel CLI:

```bash
npx vercel --prod
```

---

## Step 6 — Test

### Test the stats API

Visit: `https://YOUR-DOMAIN.vercel.app/api/donations/stats`

You should see JSON like:

```json
{
  "totalRaised": 0,
  "goal": 10000,
  "percentageFunded": 0,
  "donorCount": 0,
  "milestones": [...],
  "transparency": { ... }
}
```

### Test Stripe webhook (recommended)

1. Stripe Dashboard → Webhooks → your endpoint → **Send test event**  
2. Choose `checkout.session.completed`  
3. Confirm KV keys update in Vercel Storage → KV → Browse  

### Test a real donation

Use Stripe **test mode** first, then switch to live when ready.

---

## Updating transparency numbers (manual)

These three fields are stored in KV and can be updated without code:

| KV key | Display |
|--------|---------|
| `transparency:community_donations_cents` | Community Donations Received (in **cents**, e.g. `50000` = $500) |
| `transparency:athletes_supported` | Athletes Supported (integer) |
| `transparency:scholarships_awarded` | Scholarships Awarded (integer) |

**Vercel Dashboard → Storage → KV → your database → add/edit keys**

The live progress bar (`totalRaised`, `donorCount`) updates **automatically** from Stripe only.

---

## KV keys used automatically

| Key | Description |
|-----|-------------|
| `donation:total_cents` | Sum of completed donations (cents) |
| `donation:donor_count` | Number of completed donations |
| `donation:processed:{session_id}` | Prevents double-counting webhook retries |

---

## Milestones (built-in)

- $2,500 — Scholarships Fund  
- $5,000 — Scholarships + Equipment Fund  
- $7,500 — Scholarships + Equipment Expansion  
- $10,000 — Smash Attack Volleyball Machine + Scholarships  

Edit `lib/donation-config.js` to change milestones or goal.

---

## Using Next.js instead?

Your site is currently static HTML. To migrate to Next.js later:

1. Move pages to `app/page.tsx` or `pages/index.tsx`  
2. Move `api/` handlers to `app/api/donations/stats/route.ts` and `app/api/webhooks/stripe/route.ts`  
3. Keep the same `lib/` files and KV logic  

The Stripe + KV automation stays the same.

---

## Troubleshooting

**Progress bar stays at $0**  
- Confirm KV is connected and env vars are set  
- Confirm webhook endpoint URL matches your live domain  
- Check Vercel **Functions → Logs** for webhook errors  

**Webhook signature failed**  
- `STRIPE_WEBHOOK_SECRET` must match the endpoint signing secret exactly  

**Donations not counting**  
- Webhook must listen for `checkout.session.completed`  
- Payment Link must complete with status `paid`  

---

## Support

Questions: allmotionsports7@gmail.com · 778-223-7550
