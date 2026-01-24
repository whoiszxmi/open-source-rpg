const express = require("express");
const router = express.Router();

const { prisma } = require("../database");
const JujutsuService = require("../services/JujutsuService");
const DomainService = require("../services/DomainService");

// GET /jujutsu/:characterId
router.get("/:characterId", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    if (!characterId)
      return res.status(400).json({ error: "invalid_characterId" });

    // Garante cursedStats e retorna a ficha completa
    const data = await JujutsuService.getCharacterJujutsu(characterId);

    // Se seu JujutsuService ainda não inclui domainState, buscamos aqui (sem quebrar)
    // (Pode remover se já estiver incluindo domainState lá)
    if (data && data.id && prisma) {
      // Placeholder to keep prisma available if needed for future domainState fetch.
    }

    return res.json(data);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

// POST /jujutsu/:characterId/technique
router.post("/:characterId/technique", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    if (!characterId)
      return res.status(400).json({ error: "invalid_characterId" });

    const tech = await JujutsuService.addTechnique(characterId, req.body || {});
    return res.json(tech);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

// POST /jujutsu/:characterId/vow
router.post("/:characterId/vow", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    if (!characterId)
      return res.status(400).json({ error: "invalid_characterId" });

    const vow = await JujutsuService.addVow(characterId, req.body || {});
    return res.json(vow);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

// POST /jujutsu/turn
// body: { characterId: 1, action: { type: "reinforce" | "technique" | "domain" | "emotionalBoost", ... } }
router.post("/turn", async (req, res) => {
  try {
    const { characterId, action } = req.body || {};
    if (!characterId || !action || !action.type) {
      return res
        .status(400)
        .json({ ok: false, error: "missing_characterId_or_action" });
    }

    const result = await JujutsuService.applyTurn(Number(characterId), action);
    return res.json(result);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

// POST /jujutsu/:characterId/domain
// body: { "type": "EXPANSION" | "SIMPLE_DOMAIN" | "WICKER_BASKET" | "AMPLIFICATION" }
router.post("/:characterId/domain", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    if (!characterId)
      return res.status(400).json({ error: "invalid_characterId" });

    const type = (req.body && req.body.type) || "EXPANSION";
    const result = await DomainService.activate(characterId, type);

    return res.json(result);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
});

module.exports = router;
