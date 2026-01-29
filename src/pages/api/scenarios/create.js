import { prisma } from "../../../database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { name, description, backgroundAssetId, propsJson } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, error: "missing_name" });
    }

    const scenario = await prisma.scenario.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description) : null,
        backgroundAssetId: backgroundAssetId ? Number(backgroundAssetId) : null,
        propsJson: propsJson || null,
      },
    });

    return res
      .status(200)
      .json({ ok: true, scenario: JSON.parse(JSON.stringify(scenario)) });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, error: "internal_error", details: String(e) });
  }
}
