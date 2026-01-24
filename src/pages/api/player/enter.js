import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(404).end();

  try {
    const { access_code } = req.body || {};
    const code = String(access_code || "").trim();

    if (!code) return res.status(400).json({ error: "missing_access_code" });

    // Preferido: campo access_code no Character
    let character = null;

    // Tenta access_code se existir no schema
    try {
      character = await prisma.character.findFirst({
        where: { access_code: code },
        select: { id: true, name: true },
      });
    } catch {
      // fallback: se você ainda não tem access_code no schema, não quebra
      character = null;
    }

    // Fallback extra (opcional): permitir usar id diretamente como "código"
    if (!character && /^\d+$/.test(code)) {
      const id = Number(code);
      character = await prisma.character.findUnique({
        where: { id },
        select: { id: true, name: true },
      });
    }

    if (!character) return res.status(404).json({ error: "invalid_code" });

    return res.json({ ok: true, characterId: character.id });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "internal_error", details: String(e) });
  }
}
