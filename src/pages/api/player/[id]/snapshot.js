// src/pages/api/player/[id]/snapshot.js

import { prisma } from "../../../../database";
import { getActiveCombatContext } from "../../../lib/combat";

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

    const techniques = await prisma.innateTechnique.findMany({
      where: { characterId },
      orderBy: { id: "asc" },
    });

    const { combatId, participants } = await getActiveCombatContext(
      prisma,
      characterId,
    );

    let targets = [];
    if (participants.length > 0) {
      const targetIds = participants.filter(
        (id) => Number(id) !== Number(characterId),
      );
      if (targetIds.length > 0) {
        targets = await prisma.character.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true, is_dead: true },
          orderBy: { id: "asc" },
        });
      }
    } else {
      targets = await prisma.character.findMany({
        where: { id: { not: characterId } },
        select: { id: true, name: true, is_dead: true },
        orderBy: { id: "asc" },
      });
    }

    // evita problemas com Date/BigInt etc
    let combat = null;
    if (combatId) {
      const combatRow = await prisma.combat.findUnique({
        where: { id: combatId },
        select: {
          id: true,
          isActive: true,
          participants: true,
          roundNumber: true,
          turnIndex: true,
          turnOrder: true,
          actedThisRound: true,
        },
      });

      if (combatRow) {
        const order = Array.isArray(combatRow.turnOrder)
          ? combatRow.turnOrder
          : null;
        const currentActorId = order
          ? Number(order[combatRow.turnIndex || 0])
          : null;
        combat = {
          ...combatRow,
          currentActorId,
        };
      }
    }

    const payload = {
      ok: true,
      characterId,
      character: JSON.parse(JSON.stringify(character)),
      cursedStats: cursedStats ? JSON.parse(JSON.stringify(cursedStats)) : null,
      domainState: domainState ? JSON.parse(JSON.stringify(domainState)) : null,
      statuses: JSON.parse(JSON.stringify(statuses || [])),
      techniques: JSON.parse(JSON.stringify(techniques || [])),
      targets: JSON.parse(JSON.stringify(targets || [])),
      combatId: combatId || null,
      combat: combat ? JSON.parse(JSON.stringify(combat)) : null,
    };

    return res.status(200).json(payload);
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
