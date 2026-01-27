import { COOKIE_NAMES, clearCookie } from "../../../../lib/session";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  res.setHeader("Set-Cookie", clearCookie(COOKIE_NAMES.player));
  return res.status(200).json({ ok: true });
}
