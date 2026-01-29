const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { prisma } = require("../database");

const router = express.Router();
const uploadsRoot = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "asset", ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "missing_file" });
    }

    const asset = await prisma.asset.create({
      data: {
        name: req.body?.name ? String(req.body.name) : req.file.originalname,
        type: req.body?.type ? String(req.body.type) : "ICON",
        storage: "local",
        url: `/uploads/${req.file.filename}`,
        mime: req.file.mimetype || null,
        size: req.file.size || null,
      },
    });

    return res.json({ ok: true, asset: JSON.parse(JSON.stringify(asset)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.get("/list", async (req, res) => {
  try {
    const type = req.query?.type ? String(req.query.type) : null;
    const assets = await prisma.asset.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ ok: true, assets: JSON.parse(JSON.stringify(assets)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post("/attach", async (req, res) => {
  try {
    const { ownerType, ownerId, slot, assetId } = req.body || {};
    if (!ownerType || !ownerId || !slot || !assetId) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const ownerTypeKey = String(ownerType).toUpperCase();
    const ownerIdNum = Number(ownerId);
    const assetIdNum = Number(assetId);

    if (ownerTypeKey === "SCENARIO") {
      const updated = await prisma.scenario.update({
        where: { id: ownerIdNum },
        data: { [slot]: assetIdNum },
      });
      return res.json({ ok: true, updated });
    }

    if (ownerTypeKey === "CHARACTER" || ownerTypeKey === "ENEMY") {
      const profile = await prisma.appearanceProfile.upsert({
        where: {
          ownerType_ownerId: {
            ownerType: ownerTypeKey,
            ownerId: ownerIdNum,
          },
        },
        update: { [slot]: assetIdNum },
        create: {
          ownerType: ownerTypeKey,
          ownerId: ownerIdNum,
          [slot]: assetIdNum,
        },
      });
      return res.json({ ok: true, profile });
    }

    return res.status(400).json({ ok: false, error: "invalid_ownerType" });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

module.exports = router;
