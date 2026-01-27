const manifestCache = new Map();
const imageCache = new Map();

async function loadManifest(packId) {
  if (manifestCache.has(packId)) return manifestCache.get(packId);
  const res = await fetch(`/visualpacks/${packId}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.pack?.manifestJson) return null;
  const manifest = {
    ...data.pack.manifestJson,
    basePath: data.pack.basePath,
  };
  manifestCache.set(packId, manifest);
  return manifest;
}

function preloadImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const img = new Image();
  img.src = url;
  imageCache.set(url, img);
  return img;
}

function getSpriteDef(manifest, skinKey) {
  return manifest?.sprites?.[skinKey] || null;
}

function getFxDef(manifest, fxKey) {
  return manifest?.fx?.[fxKey] || null;
}

function resolveMapping(manifest, event) {
  const mappings = manifest?.mappings || {};
  const techMap = mappings.techniques || {};
  const defaults = mappings.default || {};
  const actionMap = defaults[event.action] || {};

  if (event.techniqueId && techMap[event.techniqueId]) {
    return techMap[event.techniqueId];
  }
  if (event.techniqueKey && techMap[event.techniqueKey]) {
    return techMap[event.techniqueKey];
  }

  return actionMap;
}

export default {
  loadManifest,
  preloadImage,
  getSpriteDef,
  getFxDef,
  resolveMapping,
};
