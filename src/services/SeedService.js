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

module.exports = {
  ensureBlessingsAndCurses,
};
