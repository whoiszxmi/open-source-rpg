const real = require("./domainEngine"); // ajuste aqui pro arquivo real

module.exports = {
  activateDomain: real.activateDomain || real.activate || real.startDomain,
  resolveSureHit: real.resolveSureHit,
};
