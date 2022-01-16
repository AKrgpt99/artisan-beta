import React from "react";

export default function PillButton({ backgroundColor, children }) {
  return (
    <button
      className="rounded-full mr-4 px-8 py-3 font-bold text-white"
      style={{ backgroundColor }}
    >
      {children}
    </button>
  );
}
