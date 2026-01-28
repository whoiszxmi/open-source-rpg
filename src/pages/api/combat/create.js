import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { name, scenarioId, participantIds } = req.body || {};
    const participants = Array.isArray(participantIds)
      ? participantIds.map((id) => Number(id)).filter(Number.isFinite)
      : [];

    if (participants.length === 0) {
      return res.status(400).json({ ok: false, error: "missing_participants" });
    }

    const combat = await prisma.combat.create({
      data: {
        name: name ? String(name) : null,
        isActive: false,
        participants,
        sceneId: scenarioId ? Number(scenarioId) : null,
        roundNumber: 1,
        turnIndex: 0,
        turnOrder: [],
        actedThisRound: [],
      },
    });

    return res.status(200).json({ ok: true, combat: JSON.parse(JSON.stringify(combat)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
