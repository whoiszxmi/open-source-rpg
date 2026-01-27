async function fetchActiveCombatContext(prisma, characterId) {
  const module = await import("../lib/combat.js");
  return module.getActiveCombatContext(prisma, characterId);
}

async function getPlayerSnapshot(prisma, characterId) {
  const cid = Number(characterId);
  const character = await prisma.character.findUnique({
    where: { id: cid },
    select: {
      id: true,
      name: true,
      player_name: true,
      level: true,
      xp: true,
      current_hit_points: true,
      max_hit_points: true,
      is_dead: true,
      standard_character_picture_url: true,
    },
  });

  if (!character) return null;

  const cursedStats = await prisma.cursedStats.findUnique({
    where: { characterId: cid },
  });

  const domainState = await prisma.domainState.findUnique({
    where: { characterId: cid },
  });

  const blackFlashState = await prisma.blackFlashState.findUnique({
    where: { characterId: cid },
  });

  const statuses = await prisma.combatStatus.findMany({
    where: { characterId: cid },
    orderBy: [{ kind: "asc" }, { key: "asc" }],
  });

  const techniques = await prisma.innateTechnique.findMany({
    where: { characterId: cid },
    orderBy: { id: "asc" },
  });

  const statGroups = await prisma.statGroup.findMany({
    where: { characterId: cid },
    include: { stats: true },
  });

  const blessings = await prisma.characterBlessing.findMany({
    where: { characterId: cid },
    include: { blessing: true },
  });

  const curses = await prisma.characterCurse.findMany({
    where: { characterId: cid },
    include: { curse: true },
  });

  const { combatId, participants } = await fetchActiveCombatContext(
    prisma,
    cid,
  );

  let targets = [];
  if (participants.length > 0) {
    const targetIds = participants.filter((id) => Number(id) !== Number(cid));
    if (targetIds.length > 0) {
      targets = await prisma.character.findMany({
        where: { id: { in: targetIds } },
        select: { id: true, name: true, is_dead: true },
        orderBy: { id: "asc" },
      });
    }
  } else {
    targets = await prisma.character.findMany({
      where: { id: { not: cid } },
      select: { id: true, name: true, is_dead: true },
      orderBy: { id: "asc" },
    });
  }

  let combat = null;
  if (combatId) {
    const combatRow = await prisma.combat.findUnique({
      where: { id: combatId },
      select: {
        id: true,
        isActive: true,
        participants: true,
        roundNumber: true,
        turnIndex: true,
        turnOrder: true,
        actedThisRound: true,
      },
    });
    if (combatRow) {
      const order = Array.isArray(combatRow.turnOrder)
        ? combatRow.turnOrder
        : null;
      const currentActorId = order
        ? Number(order[combatRow.turnIndex || 0])
        : null;
      combat = { ...combatRow, currentActorId };
    }
  }

  const groupMap = statGroups.reduce((acc, group) => {
    acc[group.type] = group;
    return acc;
  }, {});

  return {
    ok: true,
    characterId: cid,
    character: JSON.parse(JSON.stringify(character)),
    cursedStats: cursedStats ? JSON.parse(JSON.stringify(cursedStats)) : null,
    domainState: domainState ? JSON.parse(JSON.stringify(domainState)) : null,
    blackFlashState: blackFlashState
      ? JSON.parse(JSON.stringify(blackFlashState))
      : null,
    statuses: JSON.parse(JSON.stringify(statuses || [])),
    techniques: JSON.parse(JSON.stringify(techniques || [])),
    targets: JSON.parse(JSON.stringify(targets || [])),
    combatId: combatId || null,
    combat: combat ? JSON.parse(JSON.stringify(combat)) : null,
    statGroups: JSON.parse(JSON.stringify(statGroups || [])),
    statsPhysical: groupMap.PHYSICAL
      ? JSON.parse(JSON.stringify(groupMap.PHYSICAL))
      : null,
    statsJujutsu: groupMap.JUJUTSU
      ? JSON.parse(JSON.stringify(groupMap.JUJUTSU))
      : null,
    statsMental: groupMap.MENTAL
      ? JSON.parse(JSON.stringify(groupMap.MENTAL))
      : null,
    statsExtra: groupMap.EXTRA
      ? JSON.parse(JSON.stringify(groupMap.EXTRA))
      : null,
    blessings: JSON.parse(JSON.stringify(blessings || [])),
    curses: JSON.parse(JSON.stringify(curses || [])),
  };
}

module.exports = {
  getPlayerSnapshot,
};

module.exports.default = {
  getPlayerSnapshot,
};
