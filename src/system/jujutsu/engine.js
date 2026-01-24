function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function applyEnergyLeak(stats) {
  if (stats.cursedEnergy > stats.cursedControl) {
    const leak = stats.cursedEnergy - stats.cursedControl;
    stats.mentalPressure += Math.ceil(leak / 2);
  }
  stats.mentalPressure = clamp(stats.mentalPressure, 0, 100);
  return stats;
}

function spendCursedEnergy(stats, amount) {
  const a = Math.max(0, amount | 0);
  stats.cursedEnergy = clamp(stats.cursedEnergy - a, 0, stats.cursedEnergyMax);
  return applyEnergyLeak(stats);
}

function gainCursedEnergy(stats, amount) {
  const a = Math.max(0, amount | 0);
  stats.cursedEnergy = clamp(stats.cursedEnergy + a, 0, stats.cursedEnergyMax);
  return applyEnergyLeak(stats);
}

function addMentalPressure(stats, amount) {
  const a = Math.max(0, amount | 0);
  stats.mentalPressure = clamp(stats.mentalPressure + a, 0, 100);
  return stats;
}

function checkMentalBreak(stats) {
  if (stats.mentalPressure >= 100) {
    return {
      broken: true,
      effect: "Perda de controle — falha narrativa crítica",
    };
  }
  return { broken: false };
}

function reinforceBody(stats, intensity) {
  const lvl = clamp(intensity | 0, 1, 5);
  const cost = 4 * lvl;
  spendCursedEnergy(stats, cost);
  const bonus = lvl + Math.floor(stats.cursedControl / 5);
  return { cost, bonus };
}

function emotionalBoost(stats, desiredBonus) {
  const b = clamp(desiredBonus | 0, 1, 20);
  addMentalPressure(stats, b);
  return { pressureAdded: b, bonus: b * 2 };
}

module.exports = {
  applyEnergyLeak,
  spendCursedEnergy,
  gainCursedEnergy,
  addMentalPressure,
  checkMentalBreak,
  reinforceBody,
  emotionalBoost,
};
