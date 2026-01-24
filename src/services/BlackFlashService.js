function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

async function getState(prisma, characterId) {
  const cid = Number(characterId);
  let state = await prisma.blackFlashState.findUnique({
    where: { characterId: cid },
  });
  if (!state) {
    state = await prisma.blackFlashState.create({
      data: { characterId: cid, activeTurns: 0, nextThreshold: 20 },
    });
  }
  return state;
}

async function attemptBlackFlash(prisma, characterId, outputValue, rollFn) {
  const output = Number(outputValue) || 0;
  const state = await getState(prisma, characterId);

  if (output < 20) {
    return { triggered: false, roll: null, state };
  }

  const roll = rollFn ? rollFn() : 1 + Math.floor(Math.random() * 20);
  if (roll >= state.nextThreshold) {
    const nextThreshold = clamp((state.nextThreshold || 20) - 1, 17, 20);
    const updated = await prisma.blackFlashState.update({
      where: { id: state.id },
      data: { activeTurns: 5, nextThreshold },
    });
    return {
      triggered: true,
      roll,
      state: updated,
      damageMultiplier: 2.5,
      outputBonusPct: 120,
      controlBonusPct: 30,
    };
  }

  return { triggered: false, roll, state };
}

async function tickTurn(prisma, characterId) {
  const state = await getState(prisma, characterId);
  if ((state.activeTurns || 0) <= 0) return state;
  return prisma.blackFlashState.update({
    where: { id: state.id },
    data: { activeTurns: Math.max(0, (state.activeTurns || 0) - 1) },
  });
}

module.exports = {
  getState,
  attemptBlackFlash,
  tickTurn,
};
