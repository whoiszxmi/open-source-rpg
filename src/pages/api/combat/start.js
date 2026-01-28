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
    const { combatId } = req.body || {};
    const id = Number(combatId);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "invalid_combat_id" });
    }

    const combat = await prisma.combat.findUnique({ where: { id } });
    if (!combat) {
      return res.status(404).json({ ok: false, error: "combat_not_found" });
    }

    const participants = Array.isArray(combat.participants)
      ? combat.participants
      : [];
    const turnOrder = shuffle(participants.map((val) => Number(val)).filter(Number.isFinite));

    const updated = await prisma.combat.update({
      where: { id },
      data: {
        isActive: true,
        roundNumber: 1,
        turnIndex: 0,
        turnOrder,
        actedThisRound: [],
      },
    });

    await prisma.playerSession.updateMany({
      where: { characterId: { in: turnOrder } },
      data: { combatId: id },
    });

    return res.status(200).json({ ok: true, combat: JSON.parse(JSON.stringify(updated)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
