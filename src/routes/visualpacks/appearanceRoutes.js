const express = require("express");
const { prisma } = require("../../database");

const router = express.Router();

router.get("/:id/appearance", async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    if (!characterId) {
      return res.status(400).json({ ok: false, error: "missing_characterId" });
    }

    const appearance = await prisma.characterAppearance.findUnique({
      where: { characterId },
    });

    return res.json({ ok: true, appearance });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.put("/:id/appearance", async (req, res) => {
  try {
    const characterId = Number(req.params.id);
    if (!characterId) {
      return res.status(400).json({ ok: false, error: "missing_characterId" });
    }

    const { packId, skinKey, paletteKey, scale, offsetX, offsetY } =
      req.body || {};
    let visualPackId = null;
    if (packId) {
      const pack = await prisma.visualPack.findUnique({
        where: { packId: String(packId) },
        select: { id: true },
      });
      visualPackId = pack ? pack.id : null;
    }

    const appearance = await prisma.characterAppearance.upsert({
      where: { characterId },
      update: {
        packId: packId || null,
        visualPackId,
        skinKey: skinKey || "default",
        paletteKey: paletteKey || null,
        scale: Number(scale || 1),
        offsetX: Number(offsetX || 0),
        offsetY: Number(offsetY || 0),
      },
      create: {
        characterId,
        packId: packId || null,
        visualPackId,
        skinKey: skinKey || "default",
        paletteKey: paletteKey || null,
        scale: Number(scale || 1),
        offsetX: Number(offsetX || 0),
        offsetY: Number(offsetY || 0),
      },
    });

    return res.json({ ok: true, appearance });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
