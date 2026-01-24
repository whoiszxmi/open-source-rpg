import React from "react";

export default function Progress({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-white"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
