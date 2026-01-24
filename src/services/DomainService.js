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

async function activate(characterId, type) {
  const stats = await ensureCursedStats(characterId);
  const s = { ...stats };

  // domain engine é quem decide custo, turns etc
  const act = domain.activateDomain(s, type);
  if (!act.ok) return { ok: false, ...act };

  // salva cursedStats atualizado (custos)
  await prisma.cursedStats.update({
    where: { characterId },
    data: {
      cursedEnergy: s.cursedEnergy,
      cursedEnergyMax: s.cursedEnergyMax,
      cursedControl: s.cursedControl,
      mentalPressure: s.mentalPressure,
      domainUnlocked: s.domainUnlocked,
    },
  });

  // cria/atualiza domainState
  const state = await prisma.domainState.upsert({
    where: { characterId },
    update: {
      type: act.type,
      turnsRemaining: act.turnsRemaining,
      sureHitActive: act.sureHitActive,
      notes: act.notes,
    },
    create: {
      characterId,
      type: act.type,
      turnsRemaining: act.turnsRemaining,
      sureHitActive: act.sureHitActive,
      notes: act.notes,
    },
  });

  return { ok: true, state, notes: act.notes };
}

async function tick(characterId) {
  const state = await prisma.domainState.findUnique({ where: { characterId } });
  if (!state || state.turnsRemaining <= 0) return null;

  const next = state.turnsRemaining - 1;

  // se quiser “expirar” removendo ao chegar em 0, pode trocar aqui por delete.
  return prisma.domainState.update({
    where: { characterId },
    data: { turnsRemaining: next },
  });
}

module.exports = { activate, tick };
