import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const {
      name,
      type,
      storage,
      url,
      mime,
      size,
      spritesheetUrl,
      frameWidth,
      frameHeight,
      animationMap,
      meta,
    } = req.body || {};

    if (!name || !type || !url) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const asset = await prisma.asset.create({
      data: {
        name: String(name),
        type: String(type),
        storage: storage ? String(storage) : "url",
        url: String(url),
        mime: mime ? String(mime) : null,
        size: Number.isFinite(Number(size)) ? Number(size) : null,
        spritesheetUrl: spritesheetUrl ? String(spritesheetUrl) : null,
        frameWidth: Number.isFinite(Number(frameWidth)) ? Number(frameWidth) : null,
        frameHeight: Number.isFinite(Number(frameHeight)) ? Number(frameHeight) : null,
        animationMap: animationMap || null,
        meta: meta || null,
      },
    });

    return res.status(200).json({ ok: true, asset: JSON.parse(JSON.stringify(asset)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
