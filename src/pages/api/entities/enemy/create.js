import { prisma } from "../../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { name, max_hit_points, current_hit_points, techniques } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }

    const maxHp = Number(max_hit_points || 0);
    const curHp = Number(current_hit_points || maxHp || 0);

    const character = await prisma.character.create({
      data: {
        name: String(name).trim(),
        max_hit_points: Number.isFinite(maxHp) ? maxHp : 0,
        current_hit_points: Number.isFinite(curHp) ? curHp : 0,
        is_npc: true,
      },
    });

    if (Array.isArray(techniques) && techniques.length > 0) {
      const data = techniques
        .filter((tech) => tech?.name)
        .map((tech) => ({
          characterId: character.id,
          name: String(tech.name),
          description: String(tech.description || ""),
          cost: Number(tech.cost || 0),
          effect: String(tech.effect || ""),
        }));
      if (data.length > 0) {
        await prisma.innateTechnique.createMany({ data });
      }
    }

    return res.status(200).json({ ok: true, characterId: character.id });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
