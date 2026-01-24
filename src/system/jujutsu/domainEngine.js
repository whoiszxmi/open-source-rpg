const { spendCursedEnergy, addMentalPressure } = require("./engine");

const DOMAIN_TYPES = {
  EXPANSION: "EXPANSION",
  SIMPLE_DOMAIN: "SIMPLE_DOMAIN",
  WICKER_BASKET: "WICKER_BASKET",
  AMPLIFICATION: "AMPLIFICATION",
};

function activateDomain(stats, type) {
  const t = type || DOMAIN_TYPES.EXPANSION;

  // custos/efeitos base
  if (t === DOMAIN_TYPES.EXPANSION) {
    if (!stats.domainUnlocked) return { ok: false, reason: "domain_locked" };
    if (stats.cursedEnergy < 50)
      return { ok: false, reason: "not_enough_energy" };
    spendCursedEnergy(stats, 50);
    addMentalPressure(stats, 10);
    return {
      ok: true,
      type: t,
      turnsRemaining: 3,
      sureHitActive: true,
      notes: "Expansão de Domínio: sure-hit ativo",
    };
  }

  if (t === DOMAIN_TYPES.SIMPLE_DOMAIN) {
    if (stats.cursedEnergy < 20)
      return { ok: false, reason: "not_enough_energy" };
    spendCursedEnergy(stats, 20);
    addMentalPressure(stats, 5);
    return {
      ok: true,
      type: t,
      turnsRemaining: 2,
      sureHitActive: false,
      notes: "Domínio Simples: anula sure-hit na área",
    };
  }

  if (t === DOMAIN_TYPES.WICKER_BASKET) {
    if (stats.cursedEnergy < 15)
      return { ok: false, reason: "not_enough_energy" };
    spendCursedEnergy(stats, 15);
    addMentalPressure(stats, 3);
    return {
      ok: true,
      type: t,
      turnsRemaining: 2,
      sureHitActive: false,
      notes: "Cesta de Palha Oca: anula sure-hit (barreira pessoal)",
    };
  }

  if (t === DOMAIN_TYPES.AMPLIFICATION) {
    if (stats.cursedEnergy < 15)
      return { ok: false, reason: "not_enough_energy" };
    spendCursedEnergy(stats, 15);
    addMentalPressure(stats, 4);
    return {
      ok: true,
      type: t,
      turnsRemaining: 2,
      sureHitActive: false,
      notes:
        "Amplificação de Domínio: anula técnica no contato (sem usar sua técnica)",
    };
  }

  return { ok: false, reason: "unknown_domain_type" };
}

/**
 * Decide se o ataque do atacante vira "sure-hit".
 * Regra:
 * - Attacker com EXPANSION → sure-hit, a menos que
 *   - Defender tenha SIMPLE_DOMAIN ou WICKER_BASKET ativo (anula sure-hit)
 */
function resolveSureHit(attackerDomainState, defenderDomainState) {
  const attackerHasSureHit =
    attackerDomainState &&
    attackerDomainState.type === DOMAIN_TYPES.EXPANSION &&
    attackerDomainState.sureHitActive &&
    attackerDomainState.turnsRemaining > 0;

  if (!attackerHasSureHit) return { sureHit: false, reason: null };

  const defenderCancels =
    defenderDomainState &&
    defenderDomainState.turnsRemaining > 0 &&
    (defenderDomainState.type === DOMAIN_TYPES.SIMPLE_DOMAIN ||
      defenderDomainState.type === DOMAIN_TYPES.WICKER_BASKET);

  if (defenderCancels) {
    return { sureHit: false, reason: "sure_hit_cancelled" };
  }

  return { sureHit: true, reason: "domain_sure_hit" };
}

module.exports = {
  DOMAIN_TYPES,
  activateDomain,
  resolveSureHit,
};
