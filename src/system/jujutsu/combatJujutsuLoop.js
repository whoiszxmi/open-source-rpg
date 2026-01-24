import {
  spendCursedEnergy,
  reinforceBody,
  emotionalReversal,
  checkMentalBreak,
} from "./jujutsuEngine.js";
import { activateDomain } from "./domainEngine.js";

export function processTurn(player, action) {
  let result = {};

  if (action.type === "reinforce") {
    result.attack = reinforceBody(player.cursedStats, player.baseAttack);
  }

  if (action.type === "technique") {
    spendCursedEnergy(player.cursedStats, action.cost);
    result.effect = action.effect;
  }

  if (action.type === "domain") {
    result.domain = activateDomain(player.cursedStats);
  }

  if (action.type === "emotionalBoost") {
    result.bonus = emotionalReversal(player.cursedStats, action.value);
  }

  result.mentalState = checkMentalBreak(player.cursedStats);

  return result;
}
