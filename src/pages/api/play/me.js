import { prisma } from "../../../database";
import { parseCookies } from "../../../lib/session";

const SESSION_COOKIE = "psid";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[SESSION_COOKIE];
    if (!token) {
      return res.status(200).json({ ok: true, session: null });
    }

    const session = await prisma.playerSession.findUnique({
      where: { token },
      include: {
        character: { select: { id: true, name: true, is_npc: true } },
      },
    });

    if (!session || session.character?.is_npc) {
      return res.status(200).json({ ok: true, session: null });
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      await prisma.playerSession.deleteMany({ where: { token } });
      return res.status(200).json({ ok: true, session: null });
    }

    return res.status(200).json({
      ok: true,
      session: JSON.parse(JSON.stringify(session)),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
