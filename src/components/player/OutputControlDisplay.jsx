import React from "react";

export default function OutputControlDisplay({ output = 0, control = 0 }) {
  return (
    <div className="flex items-center gap-4 text-xs text-white/70">
      <div>
        <div className="text-white/50">Output</div>
        <div className="text-white">{output}</div>
      </div>
      <div>
        <div className="text-white/50">Controle</div>
        <div className="text-white">{control}</div>
      </div>
    </div>
  );
}
