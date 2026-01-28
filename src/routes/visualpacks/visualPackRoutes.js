const express = require("express");
const fs = require("fs");
const path = require("path");
const { prisma } = require("../../database");
const {
  deleteDirSafe,
  normalizePackPath,
  safeExtractZip,
  createTempDir,
} = require("../../services/visual/FileStorageService");
const {
  validateManifest,
  validatePackId,
} = require("../../services/visual/VisualPackValidator");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const packs = await prisma.visualPack.findMany({
      select: { packId: true, name: true, version: true, basePath: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ ok: true, packs });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.get("/:packId", async (req, res) => {
  try {
    const pack = await prisma.visualPack.findUnique({
      where: { packId: req.params.packId },
    });
    if (!pack) return res.status(404).json({ ok: false, error: "not_found" });
    return res.json({ ok: true, pack });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
});

router.post(
  "/upload",
  express.raw({
    type: ["application/zip", "application/octet-stream"],
    limit: "50mb",
  }),
  async (req, res) => {
    const buffer = req.body;
    const tempDir = createTempDir("pack_");
    try {
      if (!req.is(["application/zip", "application/octet-stream"])) {
        return res.status(415).json({
          ok: false,
          error: "unsupported_media_type",
          message: "Expected application/zip or application/octet-stream body.",
        });
      }

      if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        return res.status(400).json({
          ok: false,
          error: "missing_zip_body",
          message: "Request body must contain a zip file.",
        });
      }

      const manifestPath = "manifest.json";
      const zipPath = path.join(tempDir, "upload.zip");
      fs.writeFileSync(zipPath, buffer);

      try {
        safeExtractZip(zipPath, tempDir);
      } catch (error) {
        return res.status(400).json({
          ok: false,
          error: "invalid_zip",
          message: "Could not extract zip file.",
          details: String(error),
        });
      }

      const fullManifestPath = path.join(tempDir, manifestPath);
      if (!fs.existsSync(fullManifestPath)) {
        return res.status(400).json({
          ok: false,
          error: "manifest_missing",
          message: "manifest.json not found at the zip root.",
        });
      }

      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(fullManifestPath, "utf8"));
      } catch (error) {
        return res.status(400).json({
          ok: false,
          error: "invalid_manifest_json",
          message: "manifest.json is not valid JSON.",
          details: String(error),
        });
      }

      const packId = req.query.packId || manifest.packId;

      if (!validatePackId(packId)) {
        return res.status(400).json({
          ok: false,
          error: "invalid_packId",
          message: "packId is missing or invalid.",
        });
      }

      const validation = validateManifest({ ...manifest, packId });
      if (!validation.ok) {
        return res.status(400).json({
          ok: false,
          error: "invalid_manifest",
          details: validation.errors,
        });
      }

      const destPath = normalizePackPath(packId);
      deleteDirSafe(destPath);
      safeExtractZip(zipPath, destPath);

      const basePath = `/assets/packs/${packId}`;
      const visualPack = await prisma.visualPack.upsert({
        where: { packId },
        update: {
          name: manifest.name || packId,
          version: manifest.version || "1.0.0",
          description: manifest.description || null,
          manifestJson: manifest,
          basePath,
        },
        create: {
          packId,
          name: manifest.name || packId,
          version: manifest.version || "1.0.0",
          description: manifest.description || null,
          manifestJson: manifest,
          basePath,
        },
      });

      return res.json({ ok: true, visualPack });
    } catch (e) {
      return res
        .status(500)
        .json({ ok: false, error: "internal_error", details: String(e) });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },
);

module.exports = router;
