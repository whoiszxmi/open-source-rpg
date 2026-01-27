import crypto from "crypto";

const DEFAULT_SECRET =
  process.env.SESSION_SECRET || process.env.MASTER_KEY || "dev-secret";

export const COOKIE_NAMES = {
  player: "rpg_player",
  master: "rpg_master",
};

function base64UrlEncode(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url");
}

let cachedKeyPromise;

function getKey(secret) {
  if (!cachedKeyPromise) {
    const keyMaterial = crypto.createHash("sha256").update(secret).digest();
    cachedKeyPromise = crypto.webcrypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
  }
  return cachedKeyPromise;
}

export function parseCookies(header = "") {
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) return acc;
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export async function createSignedValue(payload, secret = DEFAULT_SECRET) {
  const json = JSON.stringify(payload);
  const iv = crypto.randomBytes(12);
  const key = await getKey(secret);
  const encrypted = await crypto.webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    Buffer.from(json, "utf8"),
  );
  return `${base64UrlEncode(iv)}.${base64UrlEncode(encrypted)}`;
}

export async function verifySignedValue(value, secret = DEFAULT_SECRET) {
  if (!value) return null;
  const [ivPart, dataPart] = String(value).split(".");
  if (!ivPart || !dataPart) return null;
  try {
    const iv = base64UrlDecode(ivPart);
    const data = base64UrlDecode(dataPart);
    const key = await getKey(secret);
    const decrypted = await crypto.webcrypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      data,
    );
    return JSON.parse(Buffer.from(decrypted).toString("utf8"));
  } catch {
    return null;
  }
}

export function serializeCookie(name, value, options = {}) {
  const {
    httpOnly = true,
    sameSite = "lax",
    path = "/",
    maxAge,
    secure = process.env.NODE_ENV === "production",
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (httpOnly) cookie += "; HttpOnly";
  if (secure) cookie += "; Secure";
  if (typeof maxAge === "number") cookie += `; Max-Age=${maxAge}`;
  return cookie;
}

export function clearCookie(name) {
  return serializeCookie(name, "", { maxAge: 0 });
}

export async function getSessionFromRequest(req, name) {
  const cookies = parseCookies(req?.headers?.cookie || "");
  return verifySignedValue(cookies[name]);
}
