const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PACKS_ROOT = path.join(process.cwd(), "public", "assets", "packs");
const TEMP_ROOT = path.join(process.cwd(), "tmp");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function deleteDirSafe(dirPath) {
  if (!dirPath.startsWith(PACKS_ROOT)) {
    throw new Error("Invalid pack path");
  }
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function normalizePackPath(packId) {
  return path.join(PACKS_ROOT, packId);
}

function createTempDir(prefix = "pack_") {
  ensureDir(TEMP_ROOT);
  return fs.mkdtempSync(path.join(TEMP_ROOT, prefix));
}

function isAllowedDestination(destPath) {
  return destPath.startsWith(PACKS_ROOT) || destPath.startsWith(TEMP_ROOT);
}

function listZipEntries(zipPath) {
  const output = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function safeExtractZip(zipPath, destPath) {
  if (!isAllowedDestination(destPath)) {
    throw new Error("Invalid destination path");
  }

  ensureDir(destPath);
  const entries = listZipEntries(zipPath);
  for (const entryName of entries) {
    const normalized = entryName.replace(/\\/g, "/");
    if (normalized.includes("..") || path.isAbsolute(normalized)) {
      throw new Error("Zip contains invalid path");
    }
  }

  execFileSync("unzip", ["-q", zipPath, "-d", destPath]);
}

module.exports = {
  PACKS_ROOT,
  TEMP_ROOT,
  ensureDir,
  createTempDir,
  deleteDirSafe,
  normalizePackPath,
  safeExtractZip,
};
