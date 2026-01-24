const { prisma } = require("../database");

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

async function applyStatus({
  characterId,
  sourceId = null,
  key,
  kind = "DEBUFF",
  value = 0,
  stacks = 1,
  turns = 1,
  note = null,
}) {
  const cid = Number(characterId);
  if (!cid || !key) throw new Error("applyStatus: missing characterId/key");

  const k = String(key).toUpperCase();
  const kd = String(kind || "DEBUFF").toUpperCase();

  const existing = await prisma.combatStatus.findFirst({
    where: { characterId: cid, key: k, kind: kd, turnsRemaining: { gt: 0 } },
  });

  if (existing) {
    return prisma.combatStatus.update({
      where: { id: existing.id },
      data: {
        sourceId: sourceId != null ? Number(sourceId) : null,
        value: Number.isFinite(value) ? value | 0 : existing.value,
        stacks: (existing.stacks || 1) + (stacks || 1),
        turnsRemaining: Math.max(existing.turnsRemaining || 1, turns || 1),
        note: note ?? existing.note,
      },
    });
  }

  return prisma.combatStatus.create({
    data: {
      characterId: cid,
      sourceId: sourceId != null ? Number(sourceId) : null,
      key: k,
      kind: kd,
      value: value | 0,
      stacks: stacks | 0,
      turnsRemaining: turns | 0,
      note,
    },
  });
}

async function listStatuses(characterId) {
  const cid = Number(characterId);
  return prisma.combatStatus.findMany({
    where: { characterId: cid, turnsRemaining: { gt: 0 } },
    orderBy: [{ kind: "asc" }, { key: "asc" }],
  });
}

async function tickCharacter(characterId) {
  const cid = Number(characterId);

  const statuses = await prisma.combatStatus.findMany({
    where: { characterId: cid, turnsRemaining: { gt: 0 } },
  });

  let damageApplied = 0;
  const notes = [];

  for (const st of statuses) {
    const mult = Math.max(1, st.stacks || 1);

    if (st.key === "BURN" && st.kind === "DEBUFF") {
      const dmg = Math.max(1, (st.value || 1) * mult);
      damageApplied += dmg;
      notes.push(`Queimadura: -${dmg} HP`);
    }

    if (st.key === "BLEED" && st.kind === "DEBUFF") {
      const dmg = Math.max(1, (st.value || 1) * mult);
      damageApplied += dmg;
      notes.push(`Sangramento: -${dmg} HP`);
    }
  }

  if (damageApplied > 0) {
    const ch = await prisma.character.findUnique({
      where: { id: cid },
      select: { current_hit_points: true, max_hit_points: true, is_dead: true },
    });

    const newHp = clamp(
      (ch.current_hit_points || 0) - damageApplied,
      0,
      ch.max_hit_points || 0,
    );
    const dead = newHp <= 0;

    await prisma.character.update({
      where: { id: cid },
      data: { current_hit_points: newHp, is_dead: dead },
    });
  }

  const removed = [];
  for (const st of statuses) {
    const next = (st.turnsRemaining || 0) - 1;
    if (next <= 0) {
      removed.push(st);
      await prisma.combatStatus.delete({ where: { id: st.id } });
    } else {
      await prisma.combatStatus.update({
        where: { id: st.id },
        data: { turnsRemaining: next },
      });
    }
  }

  const current = await listStatuses(cid);

  return {
    removed: removed.map((r) => ({ key: r.key, kind: r.kind })),
    dot: { damageApplied, notes },
    current,
  };
}

function computeModifiers(statuses) {
  const mods = {
    defenseDelta: 0,
    rollBonusDelta: 0,
    blocksAction: false,
    blocksTechnique: false,
    notes: [],
  };

  for (const st of statuses || []) {
    const mult = Math.max(1, st.stacks || 1);

    if (st.key === "STUN") {
      mods.blocksAction = true;
      mods.notes.push("Atordoado: não pode agir");
    }
    if (st.key === "TECH_SEAL") {
      mods.blocksTechnique = true;
      mods.notes.push("Técnica selada: não pode usar técnica");
    }

    if (st.key === "DEF_UP") mods.defenseDelta += (st.value || 1) * mult;
    if (st.key === "DEF_DOWN") mods.defenseDelta -= (st.value || 1) * mult;

    if (st.key === "ATK_UP") mods.rollBonusDelta += (st.value || 1) * mult;
    if (st.key === "ATK_DOWN") mods.rollBonusDelta -= (st.value || 1) * mult;
  }

  return mods;
}

module.exports = {
  applyStatus,
  listStatuses,
  tickCharacter,
  computeModifiers,
};
