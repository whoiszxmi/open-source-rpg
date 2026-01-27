import { prisma } from "../../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { name, participants } = req.body || {};
    const payload = Array.isArray(participants)
      ? participants.map((id) => Number(id)).filter(Number.isFinite)
      : [];

    const combat = await prisma.combat.create({
      data: {
        name: name || null,
        isActive: true,
        participants: payload,
        roundNumber: 1,
        turnIndex: 0,
        turnOrder: payload,
        actedThisRound: [],
      },
    });

    return res.status(201).json({ ok: true, combat });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
