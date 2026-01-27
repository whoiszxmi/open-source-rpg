const fs = require("fs/promises");
const path = require("path");

async function loadJson(fileName) {
  const fullPath = path.join(__dirname, "..", "config", fileName);
  const raw = await fs.readFile(fullPath, "utf8");
  return JSON.parse(raw);
}

async function syncBlessings(prisma, blessings) {
  for (const item of blessings) {
    const key = String(item.key);
    const existing = await prisma.blessing.findUnique({ where: { key } });
    const data = {
      key,
      name: item.name,
      rank: item.rank,
      cost: Number(item.cost || 0),
      category: item.category,
      description: item.description || null,
      effects: item.effects || {},
    };
    if (existing) {
      await prisma.blessing.update({ where: { key }, data });
    } else {
      await prisma.blessing.create({ data });
    }
  }
}

async function syncCurses(prisma, curses) {
  for (const item of curses) {
    const key = String(item.key);
    const existing = await prisma.curse.findUnique({ where: { key } });
    const data = {
      key,
      name: item.name,
      rank: item.rank,
      reward: Number(item.reward || 0),
      category: item.category,
      description: item.description || null,
      effects: item.effects || {},
    };
    if (existing) {
      await prisma.curse.update({ where: { key }, data });
    } else {
      await prisma.curse.create({ data });
    }
  }
}

async function ensureBlessingsAndCurses(prisma) {
  const blessings = await loadJson("blessings.json");
  const curses = await loadJson("curses.json");

  await syncBlessings(prisma, blessings || []);
  await syncCurses(prisma, curses || []);
}

async function ensureBaseVisualPack(prisma) {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "packs",
    "base_pack",
    "manifest.json",
  );
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(raw);
    const packId = manifest.packId || "base_pack";
    const basePath = `/assets/packs/${packId}`;
    await prisma.visualPack.upsert({
      where: { packId },
      update: {
        name: manifest.name || "Base Pack",
        version: manifest.version || "1.0.0",
        description: manifest.description || null,
        manifestJson: manifest,
        basePath,
        isPublic: true,
      },
      create: {
        packId,
        name: manifest.name || "Base Pack",
        version: manifest.version || "1.0.0",
        description: manifest.description || null,
        manifestJson: manifest,
        basePath,
        isPublic: true,
      },
    });
  } catch (e) {
    console.error("[Seed] Failed to sync base visual pack:", e);
  }
}

module.exports = {
  ensureBlessingsAndCurses,
  ensureBaseVisualPack,
};
