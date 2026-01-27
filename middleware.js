import { NextResponse } from "next/server";

const SECRET =
  process.env.SESSION_SECRET || process.env.MASTER_KEY || "dev-secret";
const COOKIE_PLAYER = "rpg_player";
const COOKIE_MASTER = "rpg_master";

const encoder = new TextEncoder();

function base64UrlToUint8(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getKey() {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(SECRET),
  );
  return crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
}

async function verifySignedCookie(raw) {
  if (!raw) return null;
  const [ivPart, dataPart] = raw.split(".");
  if (!ivPart || !dataPart) return null;
  try {
    const iv = base64UrlToUint8(ivPart);
    const data = base64UrlToUint8(dataPart);
    const key = await getKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    );
    const json = new TextDecoder().decode(decrypted);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  if (pathname.startsWith("/dashboard")) {
    const cookie = req.cookies.get(COOKIE_MASTER)?.value;
    const session = await verifySignedCookie(cookie);
    if (!session?.ok) {
      url.pathname = "/master/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/player")) {
    const cookie = req.cookies.get(COOKIE_PLAYER)?.value;
    const session = await verifySignedCookie(cookie);
    if (!session?.characterId) {
      url.pathname = "/play";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/player/:path*"],
};
