const express = require("express");
const { prisma } = require("../database");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const enemies = await prisma.enemyTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ ok: true, enemies: JSON.parse(JSON.stringify(enemies)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const enemy = await prisma.enemyTemplate.findUnique({ where: { id } });
    if (!enemy) return res.status(404).json({ ok: false, error: "not_found" });
    return res.json({ ok: true, enemy: JSON.parse(JSON.stringify(enemy)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, baseStatsJson, techniquesJson, appearanceProfileId } = req.body || {};
    if (!name) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }
    const enemy = await prisma.enemyTemplate.create({
      data: {
        name: String(name),
        baseStatsJson: baseStatsJson || null,
        techniquesJson: techniquesJson || null,
        appearanceProfileId: appearanceProfileId ? Number(appearanceProfileId) : null,
      },
    });
    return res.json({ ok: true, enemy: JSON.parse(JSON.stringify(enemy)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, baseStatsJson, techniquesJson, appearanceProfileId } = req.body || {};
    const enemy = await prisma.enemyTemplate.update({
      where: { id },
      data: {
        name: name ? String(name) : undefined,
        baseStatsJson: baseStatsJson ?? undefined,
        techniquesJson: techniquesJson ?? undefined,
        appearanceProfileId: appearanceProfileId ? Number(appearanceProfileId) : undefined,
      },
    });
    return res.json({ ok: true, enemy: JSON.parse(JSON.stringify(enemy)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
