function parseParticipants(raw) {
  if (Array.isArray(raw)) return raw.map(Number).filter(Number.isFinite);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map(Number).filter(Number.isFinite)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function getActiveCombatContext(prisma, characterId) {
  if (!characterId) return { combatId: null, participants: [] };

  const rows = await prisma.$queryRaw`
    SELECT id, participants
    FROM combat
    WHERE isActive = true
      AND JSON_CONTAINS(participants, ${JSON.stringify(characterId)})
    LIMIT 1
  `;

  if (!rows || rows.length === 0) {
    return { combatId: null, participants: [] };
  }

  const combat = rows[0];
  return {
    combatId: Number(combat.id),
    participants: parseParticipants(combat.participants),
  };
}

module.exports = { getActiveCombatContext };
