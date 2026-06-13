import { getDonationStats } from "../../lib/donation-store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stats = await getDonationStats();
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json(stats);
  } catch (error) {
    console.error("donations/stats error:", error);
    return res.status(500).json({ error: "Unable to load donation stats" });
  }
}
