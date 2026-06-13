import { kv } from "@vercel/kv";
import { DONATION_GOAL_DOLLARS, DONATION_MILESTONES, KV_KEYS } from "./donation-config.js";

function hasKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function centsToDollars(cents) {
  return Math.round(Number(cents || 0)) / 100;
}

function buildStats(totalCents, donorCount, transparency) {
  const totalRaised = centsToDollars(totalCents);
  const goal = DONATION_GOAL_DOLLARS;
  const percentageFunded =
    goal > 0 ? Math.min(100, Math.round((totalRaised / goal) * 1000) / 10) : 0;

  return {
    totalRaised,
    goal,
    percentageFunded,
    donorCount: Number(donorCount || 0),
    milestones: DONATION_MILESTONES,
    transparency: {
      communityDonations: centsToDollars(transparency.communityCents),
      athletesSupported: Number(transparency.athletes || 0),
      scholarshipsAwarded: Number(transparency.scholarships || 0),
    },
  };
}

export async function getDonationStats() {
  if (!hasKv()) {
    return buildStats(0, 0, { communityCents: 0, athletes: 0, scholarships: 0 });
  }

  const [totalCents, donorCount, communityCents, athletes, scholarships] = await Promise.all([
    kv.get(KV_KEYS.totalCents),
    kv.get(KV_KEYS.donorCount),
    kv.get(KV_KEYS.transparencyCommunity),
    kv.get(KV_KEYS.transparencyAthletes),
    kv.get(KV_KEYS.transparencyScholarships),
  ]);

  return buildStats(totalCents, donorCount, {
    communityCents,
    athletes,
    scholarships,
  });
}

export async function recordDonation(sessionId, amountCents) {
  if (!hasKv()) {
    throw new Error("KV is not configured");
  }

  const processedKey = `${KV_KEYS.processedPrefix}${sessionId}`;
  const alreadyProcessed = await kv.get(processedKey);
  if (alreadyProcessed) {
    return { duplicate: true };
  }

  const amount = Math.max(0, Math.round(Number(amountCents || 0)));
  if (amount <= 0) {
    return { skipped: true };
  }

  await kv.set(processedKey, true);
  await kv.incrby(KV_KEYS.totalCents, amount);
  await kv.incr(KV_KEYS.donorCount);

  return { recorded: true, amountCents: amount };
}
