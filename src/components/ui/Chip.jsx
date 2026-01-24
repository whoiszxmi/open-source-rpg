import React from "react";

export default function Chip({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white/10 text-white",
    good: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/20",
    bad: "bg-red-500/15 text-red-200 border border-red-500/20",
    warn: "bg-amber-500/15 text-amber-200 border border-amber-500/20",
    info: "bg-sky-500/15 text-sky-200 border border-sky-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
}
