import { prisma } from "../../../../database";
import {
  COOKIE_NAMES,
  createSignedValue,
  serializeCookie,
} from "../../../../lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { access_code } = req.body || {};
    const code = String(access_code || "").trim();

    if (!code) {
      return res.status(400).json({ ok: false, error: "missing_access_code" });
    }

    let character = null;

    try {
      character = await prisma.character.findFirst({
        where: { access_code: code },
        select: { id: true, name: true },
      });
    } catch {
      character = null;
    }

    if (!character && /^\d+$/.test(code)) {
      const id = Number(code);
      character = await prisma.character.findUnique({
        where: { id },
        select: { id: true, name: true },
      });
    }

    if (!character) {
      return res.status(404).json({ ok: false, error: "invalid_code" });
    }

    const token = await createSignedValue({ characterId: character.id });
    res.setHeader(
      "Set-Cookie",
      serializeCookie(COOKIE_NAMES.player, token, {
        maxAge: 60 * 60 * 24 * 30,
      }),
    );

    return res.status(200).json({ ok: true, characterId: character.id });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
