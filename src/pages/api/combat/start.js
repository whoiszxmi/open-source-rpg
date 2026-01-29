import { prisma } from "../../../database";

function shuffle(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { combatId, name, scenarioId, players, enemies } = req.body || {};
    let combat = null;
    let playerIds = Array.isArray(players) ? players.map(Number).filter(Number.isFinite) : [];
    let enemyIds = Array.isArray(enemies) ? enemies.map(Number).filter(Number.isFinite) : [];
    let participants = [];

    if (combatId) {
      const id = Number(combatId);
      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ ok: false, error: "invalid_combat_id" });
      }
      combat = await prisma.combat.findUnique({ where: { id } });
      if (!combat) {
        return res.status(404).json({ ok: false, error: "combat_not_found" });
      }
      participants = Array.isArray(combat.participants)
        ? combat.participants.map((val) => Number(val)).filter(Number.isFinite)
        : [];
    } else {
      if (playerIds.length > 0 || enemyIds.length > 0) {
        participants = playerIds;
        if (enemyIds.length > 0) {
          const templates = await prisma.enemyTemplate.findMany({
            where: { id: { in: enemyIds } },
          });
          for (const template of templates) {
            const hp = Number(template?.baseStatsJson?.hp || 0);
            const npc = await prisma.character.create({
              data: {
                name: template.name,
                is_npc: true,
                max_hit_points: hp,
                current_hit_points: hp,
              },
            });
            participants.push(npc.id);
          }
        }
      }
      combat = await prisma.combat.create({
        data: {
          name: name ? String(name) : null,
          scenarioId: scenarioId ? Number(scenarioId) : null,
          participants,
          isActive: true,
          roundNumber: 1,
          turnIndex: 0,
          turnOrder: [],
          actedThisRound: [],
        },
      });

      const rows = [
        ...playerIds.map((id) => ({
          combatId: combat.id,
          entityType: "CHARACTER",
          entityId: id,
          team: "PLAYERS",
        })),
        ...enemyIds.map((id) => ({
          combatId: combat.id,
          entityType: "ENEMY",
          entityId: id,
          team: "ENEMIES",
        })),
      ];
      if (rows.length > 0) {
        await prisma.combatParticipant.createMany({ data: rows });
      }
    }

    const turnOrder = shuffle(participants.map((val) => Number(val)).filter(Number.isFinite));

    const updated = await prisma.combat.update({
      where: { id: combat.id },
      data: {
        isActive: true,
        roundNumber: 1,
        turnIndex: 0,
        turnOrder,
        actedThisRound: [],
      },
    });

    if (playerIds.length > 0) {
      await prisma.playerSession.updateMany({
        where: { characterId: { in: playerIds } },
        data: { combatId: updated.id },
      });
    }

    return res
      .status(200)
      .json({ ok: true, combat: JSON.parse(JSON.stringify(updated)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
