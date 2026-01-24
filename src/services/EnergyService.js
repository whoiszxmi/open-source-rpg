const controlModifiers = require("../config/control-cost-modifiers.json");

function getControlModifier(rank) {
  const key = String(rank || "C").toUpperCase();
  return Number(controlModifiers[key] ?? 0);
}

function getFinalCost(baseCost, rank) {
  const base = Number(baseCost) || 0;
  const modifier = getControlModifier(rank);
  return Math.ceil(base * (1 + modifier));
}

module.exports = {
  getControlModifier,
  getFinalCost,
};
