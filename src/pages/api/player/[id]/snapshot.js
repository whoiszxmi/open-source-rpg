// src/pages/api/player/[id]/snapshot.js

const { prisma } = require("../../../../database");

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const idRaw = req.query?.id;
    const characterId = Number(idRaw);

    if (!characterId || Number.isNaN(characterId)) {
      return res.status(400).json({ ok: false, error: "invalid_character_id" });
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        player_name: true,
        current_hit_points: true,
        max_hit_points: true,
        is_dead: true,
        standard_character_picture_url: true,
      },
    });

    if (!character) {
      return res.status(404).json({ ok: false, error: "character_not_found" });
    }

    const cursedStats = await prisma.cursedStats.findUnique({
      where: { characterId },
    });

    const domainState = await prisma.domainState.findUnique({
      where: { characterId },
    });

    const statuses = await prisma.combatStatus.findMany({
      where: { characterId },
      orderBy: [{ kind: "asc" }, { key: "asc" }],
    });

    // evita problemas com Date/BigInt etc
    const payload = {
      ok: true,
      characterId,
      character: JSON.parse(JSON.stringify(character)),
      cursedStats: cursedStats ? JSON.parse(JSON.stringify(cursedStats)) : null,
      domainState: domainState ? JSON.parse(JSON.stringify(domainState)) : null,
      statuses: JSON.parse(JSON.stringify(statuses || [])),
    };

    return res.status(200).json(payload);
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
