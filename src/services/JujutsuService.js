const { prisma } = require("../database");

const engine = require("../system/jujutsu/engine");
const domain = require("../system/jujutsu/domain");

async function ensureCursedStats(characterId) {
  const existing = await prisma.cursedStats.findUnique({
    where: { characterId },
  });
  if (existing) return existing;

  return prisma.cursedStats.create({
    data: {
      characterId,
      cursedEnergyMax: 100,
      cursedEnergy: 100,
      cursedControl: 10,
      mentalPressure: 0,
      domainUnlocked: false,
    },
  });
}

async function getCharacterJujutsu(characterId) {
  await ensureCursedStats(characterId);

  return prisma.character.findUnique({
    where: { id: characterId },
    include: {
      cursedStats: true,
      innateTechniques: true,
      bindingVows: true,
      domainState: true,
    },
  });
}

async function applyTurn(characterId, action) {
  const stats = await ensureCursedStats(characterId);
  const s = { ...stats };
  let output = { ok: true, action, effects: [] };

  if (action.type === "reinforce") {
    const r = engine.reinforceBody(s, action.intensity || 1);
    output.effects.push({ type: "reinforce", ...r });
  }

  if (action.type === "emotionalBoost") {
    const r = engine.emotionalBoost(s, action.value || 5);
    output.effects.push({ type: "emotionalBoost", ...r });
  }

  if (action.type === "technique") {
    const tech = await prisma.innateTechnique.findFirst({
      where: { id: action.techniqueId, characterId },
    });
    if (!tech) return { ok: false, error: "technique_not_found" };

    engine.spendCursedEnergy(s, tech.cost);
    output.effects.push({
      type: "technique",
      name: tech.name,
      effect: tech.effect,
      cost: tech.cost,
    });
  }

  if (action.type === "domain") {
    const r = domain.activateDomain(s);
    output.effects.push({ type: "domain", ...r });
  }

  const mental = engine.checkMentalBreak(s);
  if (mental.broken) output.effects.push(mental);

  const updated = await prisma.cursedStats.update({
    where: { characterId },
    data: {
      cursedEnergy: s.cursedEnergy,
      cursedEnergyMax: s.cursedEnergyMax,
      cursedControl: s.cursedControl,
      mentalPressure: s.mentalPressure,
      domainUnlocked: s.domainUnlocked,
    },
  });

  output.cursedStats = updated;
  return output;
}

async function addTechnique(characterId, payload) {
  await ensureCursedStats(characterId);
  return prisma.innateTechnique.create({
    data: {
      characterId,
      name: payload.name,
      description: payload.description || "",
      cost: payload.cost || 10,
      effect: payload.effect || "",
    },
  });
}

async function addVow(characterId, payload) {
  await ensureCursedStats(characterId);
  return prisma.bindingVow.create({
    data: {
      characterId,
      vow: payload.vow,
      bonus: payload.bonus,
      penalty: payload.penalty,
    },
  });
}

module.exports = {
  getCharacterJujutsu,
  applyTurn,
  addTechnique,
  addVow,
  ensureCursedStats,
};
