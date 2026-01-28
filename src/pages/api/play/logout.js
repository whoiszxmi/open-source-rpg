import { prisma } from "../../../database";
import { clearCookie, parseCookies } from "../../../lib/session";

const SESSION_COOKIE = "psid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[SESSION_COOKIE];
    if (token) {
      await prisma.playerSession.deleteMany({ where: { token } });
    }

    res.setHeader("Set-Cookie", clearCookie(SESSION_COOKIE));
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
