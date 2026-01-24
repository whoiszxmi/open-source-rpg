import React from "react";

export default function RankBadge({ rank = "F" }) {
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-white border rounded-lg border-white/10 bg-white/5">
      Rank {rank}
    </span>
  );
}
