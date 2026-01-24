const engine = require("./engine");

function getJujutsuModifiers(cursedStats, action) {
  const mods = { rollBonus: 0, notes: [] };

  if (!cursedStats) return mods;

  if (action && action.jujutsu && action.jujutsu.type === "reinforce") {
    const r = engine.reinforceBody(cursedStats, action.jujutsu.intensity || 1);
    mods.rollBonus += r.bonus;
    mods.notes.push(`Reforço corporal +${r.bonus} (custo ${r.cost} EA)`);
  }

  if (action && action.jujutsu && action.jujutsu.type === "emotionalBoost") {
    const r = engine.emotionalBoost(cursedStats, action.jujutsu.value || 5);
    mods.rollBonus += r.bonus;
    mods.notes.push(`Boost emocional +${r.bonus} (PM +${r.pressureAdded})`);
  }

  return mods;
}

module.exports = { getJujutsuModifiers };
