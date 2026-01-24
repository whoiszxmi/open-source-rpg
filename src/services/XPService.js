const xpTable = require("../config/xp-table.json");

function getNextLevelXp(level) {
  return Number(xpTable[String(level + 1)] || 0);
}

async function applyXp(prisma, characterId, xpGained) {
  const ch = await prisma.character.findUnique({
    where: { id: Number(characterId) },
    select: { id: true, level: true, xp: true },
  });
  if (!ch) throw new Error("character_not_found");

  let level = ch.level || 1;
  let xp = (ch.xp || 0) + (Number(xpGained) || 0);
  let leveledUp = false;
  let pointsGranted = 0;

  let nextXp = getNextLevelXp(level);
  while (nextXp && xp >= nextXp) {
    xp = 0;
    level += 1;
    pointsGranted += 10;
    leveledUp = true;
    nextXp = getNextLevelXp(level);
  }

  await prisma.character.update({
    where: { id: ch.id },
    data: { level, xp },
  });

  if (pointsGranted > 0) {
    await prisma.statGroup.updateMany({
      where: { characterId: ch.id },
      data: { totalPoints: { increment: pointsGranted } },
    });
  }

  return {
    characterId: ch.id,
    level,
    xp,
    leveledUp,
    pointsGranted,
    nextLevelXp: getNextLevelXp(level),
  };
}

module.exports = {
  getNextLevelXp,
  applyXp,
};
