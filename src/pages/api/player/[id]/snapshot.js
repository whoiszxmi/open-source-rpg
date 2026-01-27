// src/pages/api/player/[id]/snapshot.js

import { prisma } from "../../../database";
import SnapshotService from "../../../services/SnapshotService";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const idRaw = req.query?.id;
    const characterId = Number(idRaw);

    if (!characterId || Number.isNaN(characterId)) {
      return res
        .status(400)
        .json({ ok: false, error: "invalid_character_id" });
    }

    const snapshot = await SnapshotService.getPlayerSnapshot(
      prisma,
      characterId,
    );

    if (!snapshot) {
      return res
        .status(404)
        .json({ ok: false, error: "character_not_found" });
    }

    return res.status(200).json(snapshot);
  } catch (e) {
    console.error("Snapshot error:", e);
    return res.status(500).json({
      ok: false,
      error: "internal_error",
      details: String(e),
    });
  }
}
