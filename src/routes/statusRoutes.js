const express = require("express");
const router = express.Router();

const CombatStatusService = require("../services/CombatStatusService");

// GET /status/:characterId
router.get("/:characterId", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    const statuses = await CombatStatusService.listStatuses(characterId);
    res.json({ characterId, statuses });
  } catch (e) {
    res.status(500).json({ error: "internal_error", details: String(e) });
  }
});

// POST /status/apply
// body: { characterId, sourceId?, key, kind?, value?, stacks?, turns?, note? }
router.post("/apply", async (req, res) => {
  try {
    const st = await CombatStatusService.applyStatus(req.body || {});
    res.json({ ok: true, status: st });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) });
  }
});

// POST /status/tick/:characterId
router.post("/tick/:characterId", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    const result = await CombatStatusService.tickCharacter(characterId);
    res.json({ ok: true, characterId, ...result });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

module.exports = router;
