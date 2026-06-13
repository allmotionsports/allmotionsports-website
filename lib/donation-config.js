/** Fundraising goal and milestone labels (amounts in dollars CAD). */
export const DONATION_GOAL_DOLLARS = Number(process.env.DONATION_GOAL_DOLLARS || 10000);

export const DONATION_MILESTONES = [
  { amount: 2500, label: "Scholarships Fund" },
  { amount: 5000, label: "Scholarships + Equipment Fund" },
  { amount: 7500, label: "Scholarships + Equipment Expansion" },
  { amount: 10000, label: "Smash Attack Volleyball Machine + Scholarships" },
];

export const KV_KEYS = {
  totalCents: "donation:total_cents",
  donorCount: "donation:donor_count",
  processedPrefix: "donation:processed:",
  transparencyCommunity: "transparency:community_donations_cents",
  transparencyAthletes: "transparency:athletes_supported",
  transparencyScholarships: "transparency:scholarships_awarded",
};
