const rankThresholds = require("../config/rank-thresholds.json");

const orderedRanks = Object.entries(rankThresholds)
  .map(([rank, threshold]) => ({ rank, threshold }))
  .sort((a, b) => b.threshold - a.threshold);

function getRankForPoints(points) {
  const total = Number(points) || 0;
  for (const entry of orderedRanks) {
    if (total >= entry.threshold) return entry.rank;
  }
  return "F";
}

module.exports = {
  getRankForPoints,
};
