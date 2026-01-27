const { getActiveCombatContext } = require("../lib/combat");

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
      appearance_key: true,
      idle_anim_key: true,
      attack_anim_key: true,
      hit_anim_key: true,
      scene_key: true,
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

  const appearance = await prisma.characterAppearance.findUnique({
    where: { characterId: cid },
    include: { visualPack: true },
  });

  const blessings = await prisma.characterBlessing.findMany({
    where: { characterId: cid },
    include: { blessing: true },
  });

  const curses = await prisma.characterCurse.findMany({
    where: { characterId: cid },
    include: { curse: true },
  });

  const { combatId, participants } = await getActiveCombatContext(prisma, cid);

  let combatScene = null;
  let targets = [];
  if (participants.length > 0) {
    const targetIds = participants.filter((id) => Number(id) !== Number(cid));
    if (targetIds.length > 0) {
      const targetRows = await prisma.character.findMany({
        where: { id: { in: targetIds } },
        select: { id: true, name: true, is_dead: true },
        orderBy: { id: "asc" },
      });
      const appearances = await prisma.characterAppearance.findMany({
        where: { characterId: { in: targetIds } },
      });
      const appearanceMap = new Map(
        appearances.map((row) => [row.characterId, row]),
      );
      targets = targetRows.map((row) => ({
        ...row,
        appearance: appearanceMap.get(row.id) || null,
      }));
    }
  } else {
    const targetRows = await prisma.character.findMany({
      where: { id: { not: cid } },
      select: { id: true, name: true, is_dead: true },
      orderBy: { id: "asc" },
    });
    const targetIds = targetRows.map((row) => row.id);
    const appearances = await prisma.characterAppearance.findMany({
      where: { characterId: { in: targetIds } },
    });
    const appearanceMap = new Map(
      appearances.map((row) => [row.characterId, row]),
    );
    targets = targetRows.map((row) => ({
      ...row,
      appearance: appearanceMap.get(row.id) || null,
    }));
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
        sceneId: true,
        sceneKey: true,
        scenePackId: true,
      },
    });
    if (combatRow) {
      const order = Array.isArray(combatRow.turnOrder)
        ? combatRow.turnOrder
        : null;
      const currentActorId = order
        ? Number(order[combatRow.turnIndex || 0])
        : null;
      if (combatRow.sceneId) {
        combatScene = await prisma.scene.findUnique({
          where: { id: combatRow.sceneId },
        });
      }
      combat = { ...combatRow, currentActorId };
    }
  }

  const groupMap = statGroups.reduce((acc, group) => {
    acc[group.type] = group;
    return acc;
  }, {});

  const computedModifiers = { stats: {} };
  const traitSources = [
    ...blessings.map((b) => b?.blessing),
    ...curses.map((c) => c?.curse),
  ].filter(Boolean);

  for (const trait of traitSources) {
    const stats = trait?.effects?.stats || {};
    for (const [key, value] of Object.entries(stats)) {
      const current = Number(computedModifiers.stats[key] || 0);
      computedModifiers.stats[key] = current + Number(value || 0);
    }
  }

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
    scene: combatScene ? JSON.parse(JSON.stringify(combatScene)) : null,
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
    appearance: appearance ? JSON.parse(JSON.stringify(appearance)) : null,
    computedModifiers,
  };
}

module.exports = {
  getPlayerSnapshot,
};
