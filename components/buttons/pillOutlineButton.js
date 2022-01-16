import React from "react";

export default function PillOutlineButton({ borderColor, children }) {
  return (
    <button
      className="rounded-full px-8 py-3 border-solid border-2 font-bold"
      style={{
        borderColor,
        color: borderColor,
      }}
    >
      {children}
    </button>
  );
}
