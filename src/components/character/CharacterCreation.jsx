import React from "react";

export default function CharacterCreation({
  title = "Criação de personagem",
  children,
}) {
  return (
    <div className="p-6 border rounded-2xl border-white/10 bg-white/5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
