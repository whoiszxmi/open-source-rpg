async function getStatGroup(prisma, characterId, type) {
  return prisma.statGroup.findFirst({
    where: { characterId: Number(characterId), type },
    include: { stats: true },
  });
}

async function getStatValue(prisma, characterId, key, type = null) {
  const where = {
    key: String(key || "").toUpperCase(),
    group: {
      is: {
        characterId: Number(characterId),
        ...(type ? { type } : {}),
      },
    },
  };

  const row = await prisma.statValue.findFirst({ where });
  return row ? Number(row.value || 0) : 0;
}

module.exports = {
  getStatGroup,
  getStatValue,
};
