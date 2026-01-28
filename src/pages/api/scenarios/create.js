import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { name, backgroundAssetId, musicAssetId, meta } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }

    const scene = await prisma.scene.create({
      data: {
        name: String(name).trim(),
        sceneKey: String(name).trim().toLowerCase().replace(/\s+/g, "_"),
        backgroundAssetId: backgroundAssetId ? Number(backgroundAssetId) : null,
        musicAssetId: musicAssetId ? Number(musicAssetId) : null,
        meta: meta || null,
      },
    });

    return res.status(200).json({ ok: true, scene: JSON.parse(JSON.stringify(scene)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
