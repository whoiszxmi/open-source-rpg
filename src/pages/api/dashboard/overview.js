import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const [characters, combats] = await Promise.all([
      prisma.character.count(),
      prisma.combat.count({ where: { isActive: true } }),
    ]);

    const logs = await prisma.combatLog.findMany({
      take: 8,
      orderBy: { created_at: "desc" },
    });

    return res.json({
      ok: true,
      totals: { characters, combats },
      logs: JSON.parse(JSON.stringify(logs)),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
