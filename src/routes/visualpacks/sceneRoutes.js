const express = require("express");
const { prisma } = require("../../database");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const scenes = await prisma.scene.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ ok: true, scenes });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { sceneKey, name, packId, configJson } = req.body || {};
    if (!sceneKey || !name) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    let visualPackId = null;
    if (packId) {
      const pack = await prisma.visualPack.findUnique({
        where: { packId: String(packId) },
        select: { id: true },
      });
      visualPackId = pack?.id || null;
    }

    const scene = await prisma.scene.create({
      data: {
        sceneKey: String(sceneKey),
        name: String(name),
        packId: packId || null,
        visualPackId,
        configJson: configJson || null,
      },
    });

    return res.status(201).json({ ok: true, scene });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
