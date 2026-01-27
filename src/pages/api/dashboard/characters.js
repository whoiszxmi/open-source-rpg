import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        player_name: true,
        level: true,
        current_hit_points: true,
        max_hit_points: true,
        is_dead: true,
      },
      orderBy: { name: "asc" },
    });

    return res.json({ ok: true, characters });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
