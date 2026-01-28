import { prisma } from "../../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { name, baseStatsJson, techniquesJson } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }

    const enemy = await prisma.enemyTemplate.create({
      data: {
        name: String(name).trim(),
        baseStatsJson: baseStatsJson || null,
        techniquesJson: techniquesJson || null,
      },
    });

    return res.status(200).json({ ok: true, enemyId: enemy.id });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
