import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 shadow-sm shadow-black/10 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`px-4 pt-4 pb-2 ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}
