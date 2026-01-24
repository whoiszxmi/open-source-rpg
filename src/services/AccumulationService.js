const { getStatValue } = require("./StatsService");

async function getBlessingCostTotal(prisma, characterId) {
  const rows = await prisma.characterBlessing.findMany({
    where: { characterId: Number(characterId) },
    include: { blessing: true },
  });
  return rows.reduce((sum, row) => sum + (row.blessing?.cost || 0), 0);
}

async function getCurseRewardTotal(prisma, characterId) {
  const rows = await prisma.characterCurse.findMany({
    where: { characterId: Number(characterId) },
    include: { curse: true },
  });
  return rows.reduce((sum, row) => sum + (row.curse?.reward || 0), 0);
}

async function getAccumulationBalance(prisma, characterId) {
  const base = await getStatValue(prisma, characterId, "ACCUMULATION", "EXTRA");
  const blessingCost = await getBlessingCostTotal(prisma, characterId);
  const curseReward = await getCurseRewardTotal(prisma, characterId);
  const balance = base + curseReward - blessingCost;
  return {
    base,
    blessingCost,
    curseReward,
    balance,
  };
}

function detectConflict(effects, againstKey) {
  if (!effects) return false;
  const conflicts = effects.conflicts || [];
  if (Array.isArray(conflicts)) {
    return conflicts.map(String).includes(String(againstKey));
  }
  return false;
}

async function canAddBlessing(prisma, characterId, blessing) {
  const { balance } = await getAccumulationBalance(prisma, characterId);
  return balance - (blessing.cost || 0) >= 0;
}

async function canAddCurse(prisma, characterId, curse) {
  const { balance } = await getAccumulationBalance(prisma, characterId);
  return balance + (curse.reward || 0) >= 0;
}

async function hasConflict(prisma, characterId, blessingOrCurse, type) {
  if (type === "blessing") {
    const existing = await prisma.characterCurse.findMany({
      where: { characterId: Number(characterId) },
      include: { curse: true },
    });
    return existing.some((row) =>
      detectConflict(blessingOrCurse.effects, row.curse?.key),
    );
  }

  const existing = await prisma.characterBlessing.findMany({
    where: { characterId: Number(characterId) },
    include: { blessing: true },
  });
  return existing.some((row) =>
    detectConflict(blessingOrCurse.effects, row.blessing?.key),
  );
}

module.exports = {
  getAccumulationBalance,
  canAddBlessing,
  canAddCurse,
  hasConflict,
};
