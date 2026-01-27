import { prisma } from "../../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { characterId, key, kind, turnsRemaining, value } = req.body || {};
    const cid = Number(characterId);
    if (!cid || !key || !kind) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const status = await prisma.combatStatus.create({
      data: {
        characterId: cid,
        key: String(key).toUpperCase(),
        kind: String(kind).toUpperCase(),
        turnsRemaining: Number(turnsRemaining || 1),
        value: Number(value || 0),
      },
    });

    return res.json({ ok: true, status });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
