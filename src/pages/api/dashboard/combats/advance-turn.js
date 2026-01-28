import { prisma } from "../../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { combatId } = req.body || {};
    const id = Number(combatId);
    if (!id) {
      return res.status(400).json({ ok: false, error: "missing_combat_id" });
    }

    const combat = await prisma.combat.findUnique({ where: { id } });
    if (!combat) {
      return res.status(404).json({ ok: false, error: "combat_not_found" });
    }

    const order = Array.isArray(combat.turnOrder)
      ? combat.turnOrder
      : combat.participants || [];
    const nextIndex = order.length
      ? (Number(combat.turnIndex || 0) + 1) % order.length
      : 0;
    const roundNumber =
      order.length && nextIndex === 0
        ? Number(combat.roundNumber || 1) + 1
        : combat.roundNumber || 1;

    const updated = await prisma.combat.update({
      where: { id },
      data: {
        turnIndex: nextIndex,
        roundNumber,
        actedThisRound: [],
      },
    });

    return res.json({ ok: true, combat: updated });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
