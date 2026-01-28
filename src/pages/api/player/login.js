import crypto from "crypto";
import { prisma } from "../../../database";
import { serializeCookie } from "../../../lib/session";

const SESSION_COOKIE = "psid";
const SESSION_DAYS = 30;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { characterId, access_code } = req.body || {};
    let character = null;

    if (characterId) {
      const id = Number(characterId);
      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ ok: false, error: "invalid_character_id" });
      }
      character = await prisma.character.findUnique({
        where: { id },
        select: { id: true, name: true, is_npc: true },
      });
    }

    if (!character && access_code) {
      const code = String(access_code || "").trim();
      if (!code) {
        return res.status(400).json({ ok: false, error: "missing_access_code" });
      }
      character = await prisma.character.findFirst({
        where: { access_code: code },
        select: { id: true, name: true, is_npc: true },
      });
    }

    if (!character || character.is_npc) {
      return res.status(404).json({ ok: false, error: "character_not_found" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = addDays(new Date(), SESSION_DAYS);

    await prisma.playerSession.create({
      data: {
        token,
        characterId: character.id,
        expiresAt,
      },
    });

    res.setHeader(
      "Set-Cookie",
      serializeCookie(SESSION_COOKIE, token, {
        maxAge: 60 * 60 * 24 * SESSION_DAYS,
      }),
    );

    return res.status(200).json({ ok: true, characterId: character.id, token });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
