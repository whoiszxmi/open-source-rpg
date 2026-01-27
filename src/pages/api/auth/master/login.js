import {
  COOKIE_NAMES,
  createSignedValue,
  serializeCookie,
} from "../../../../lib/session";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const masterKey = process.env.MASTER_KEY;
  if (!masterKey) {
    return res
      .status(500)
      .json({ ok: false, error: "master_key_not_configured" });
  }

  const { key } = req.body || {};
  if (String(key || "") !== String(masterKey)) {
    return res.status(401).json({ ok: false, error: "invalid_master_key" });
  }

  const token = await createSignedValue({ ok: true, ts: Date.now() });
  res.setHeader(
    "Set-Cookie",
    serializeCookie(COOKIE_NAMES.master, token, {
      maxAge: 60 * 60 * 24 * 7,
    }),
  );

  return res.status(200).json({ ok: true });
}
