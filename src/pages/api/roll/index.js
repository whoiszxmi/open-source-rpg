import { prisma } from "../../../database";
import { generateRandomNumber } from "../../../utils";

// engine robusto (CommonJS) — como estamos em ESM aqui, importamos via require:
const engine = require("../../../system/jujutsu/engine");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(404).end();

  const { body } = req;

  if (!body.character_id || !body.max_number) {
    return res.status(400).json({ error: "Data not Set" });
  }

  const characterId = Number(body.character_id);
  const maxNumber = Number(body.max_number);

  // pega o personagem + cursedStats
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { cursedStats: true },
  });

  if (!character) {
    return res.status(400).json({ error: "Character not found" });
  }

  // garante cursedStats (caso tenha personagem antigo no DB)
  let cursedStats = character.cursedStats;
  if (!cursedStats) {
    cursedStats = await prisma.cursedStats.create({
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

  // times default = 1
  const times = body.times ? Number(body.times) : 1;

  // ===== Jujutsu modifiers =====
  // body.jujutsu é opcional
  // Ex:
  //  { jujutsu: { type: "reinforce", intensity: 3 } }
  //  { jujutsu: { type: "emotionalBoost", value: 5 } }
  const jujutsu = body.jujutsu || null;

  // trabalhamos numa cópia mutável e depois salvamos
  const s = { ...cursedStats };

  let rollBonus = 0;
  const notes = [];

  if (jujutsu && jujutsu.type === "reinforce") {
    const r = engine.reinforceBody(s, jujutsu.intensity || 1);
    rollBonus += r.bonus;
    notes.push(`Reforço corporal +${r.bonus} (custo ${r.cost} EA)`);
  }

  if (jujutsu && jujutsu.type === "emotionalBoost") {
    const r = engine.emotionalBoost(s, jujutsu.value || 5);
    rollBonus += r.bonus;
    notes.push(`Boost emocional +${r.bonus} (PM +${r.pressureAdded})`);
  }

  // ===== Generate rolls =====
  const rolls = [];

  for (let i = 0; i < times; i++) {
    const base = generateRandomNumber(maxNumber); // 1..maxNumber (assumindo)
    const finalNumber = base + rollBonus;

    rolls.push({
      max_number: maxNumber,
      rolled_number: finalNumber,
      character_id: characterId,
    });
  }

  await prisma.roll.createMany({ data: rolls });

  // Persistir cursedStats caso tenhamos usado Jujutsu
  if (jujutsu) {
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
  }

  return res.status(200).json({
    rolls,
    jujutsu: jujutsu
      ? {
          rollBonus,
          notes,
          cursedStatsAfter: {
            cursedEnergy: s.cursedEnergy,
            cursedEnergyMax: s.cursedEnergyMax,
            cursedControl: s.cursedControl,
            mentalPressure: s.mentalPressure,
            domainUnlocked: s.domainUnlocked,
          },
        }
      : null,
  });
}
