const express = require("express");
const { prisma } = require("../database");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ ok: true, scenarios: JSON.parse(JSON.stringify(scenarios)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const scenario = await prisma.scenario.findUnique({ where: { id } });
    if (!scenario) return res.status(404).json({ ok: false, error: "not_found" });
    return res.json({ ok: true, scenario: JSON.parse(JSON.stringify(scenario)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, backgroundAssetId, propsJson } = req.body || {};
    if (!name) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }
    const scenario = await prisma.scenario.create({
      data: {
        name: String(name),
        description: description ? String(description) : null,
        backgroundAssetId: backgroundAssetId ? Number(backgroundAssetId) : null,
        propsJson: propsJson || null,
      },
    });
    return res.json({ ok: true, scenario: JSON.parse(JSON.stringify(scenario)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, backgroundAssetId, propsJson } = req.body || {};
    const scenario = await prisma.scenario.update({
      where: { id },
      data: {
        name: name ? String(name) : undefined,
        description: description ? String(description) : undefined,
        backgroundAssetId: backgroundAssetId ? Number(backgroundAssetId) : undefined,
        propsJson: propsJson ?? undefined,
      },
    });
    return res.json({ ok: true, scenario: JSON.parse(JSON.stringify(scenario)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
