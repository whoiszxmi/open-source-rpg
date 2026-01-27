const path = require("path");

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validatePackId(packId) {
  return /^[a-z0-9_-]{3,64}$/.test(packId);
}

function validateRelativePath(p) {
  if (!p || typeof p !== "string") return false;
  if (p.includes("..")) return false;
  const normalized = path.posix.normalize(p).replace(/\\/g, "/");
  return !normalized.startsWith("../") && !path.isAbsolute(normalized);
}

function validateManifest(manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) {
    return { ok: false, errors: ["Manifest must be an object"] };
  }

  if (!manifest.packId || !validatePackId(manifest.packId)) {
    errors.push("packId inválido (use a-z0-9_- 3-64)");
  }
  if (!manifest.name) errors.push("name é obrigatório");
  if (!manifest.version) errors.push("version é obrigatório");
  if (!isPlainObject(manifest.sprites)) errors.push("sprites deve ser objeto");
  if (!isPlainObject(manifest.fx)) errors.push("fx deve ser objeto");
  if (!isPlainObject(manifest.scenes)) errors.push("scenes deve ser objeto");

  for (const [key, sprite] of Object.entries(manifest.sprites || {})) {
    if (!sprite.image || !validateRelativePath(sprite.image)) {
      errors.push(`sprite ${key} image inválida`);
    }
  }

  for (const [key, fx] of Object.entries(manifest.fx || {})) {
    if (!fx.image || !validateRelativePath(fx.image)) {
      errors.push(`fx ${key} image inválida`);
    }
  }

  for (const [key, scene] of Object.entries(manifest.scenes || {})) {
    if (scene.background && !validateRelativePath(scene.background)) {
      errors.push(`scene ${key} background inválido`);
    }
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  validateManifest,
  validatePackId,
  validateRelativePath,
};
