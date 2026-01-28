import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const combats = await prisma.combat.findMany({
      where: { isActive: true },
      orderBy: { created_at: "desc" },
    });
    return res.json({ ok: true, combats });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
