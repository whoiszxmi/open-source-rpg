function resolveVisualForEvent({ packManifest, event }) {
  const mappings = packManifest?.mappings || {};
  const techMap = mappings.techniques || {};
  const statusMap = mappings.statuses || {};
  const defaults = mappings.default || {};

  const techniqueKey = event.techniqueId || event.techniqueKey || null;
  if (techniqueKey && techMap[techniqueKey]) {
    return { ...techMap[techniqueKey], statusOverlay: null };
  }

  const actionMap = defaults[event.action] || {};
  const statusOverlay = event.statusKey ? statusMap[event.statusKey] : null;

  return {
    actorAnim: actionMap.actorAnim || "idle",
    targetAnim: actionMap.targetAnim || "hit",
    fx: actionMap.fx || null,
    overlayFx: actionMap.overlayFx || null,
    screenShake: actionMap.screenShake || null,
    statusOverlay,
  };
}

module.exports = { resolveVisualForEvent };
