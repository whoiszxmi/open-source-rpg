await prisma.cursedStats.upsert({
  where: { characterId: character.id },
  update: {},
  create: {
    characterId: character.id,
    cursedEnergyMax: 100,
    cursedEnergy: 100,
    cursedControl: 10,
    mentalPressure: 0,
    domainUnlocked: false,
  },
});
