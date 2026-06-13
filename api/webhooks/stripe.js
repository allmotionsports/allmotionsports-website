import Stripe from "stripe";
import { recordDonation } from "../../lib/donation-store.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY");
    return res.status(500).json({ error: "Stripe is not configured" });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const signature = req.headers["stripe-signature"];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.id) {
        await recordDonation(session.id, session.amount_total);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
