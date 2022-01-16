import React from "react";

export default function RewardCard({
  image,
  name,
  items,
  winners,
  rewardType,
}) {
  return (
    <button
      className="columns-2 w-72 h-24 rounded-lg bg-white text-left relative"
      style={{
        boxShadow: "4px 4px 24px rgba(0, 0, 0, 0.125)",
      }}
    >
      <img
        className="w-12 h-12 rounded-full mt-0 bg-black object-cover absolute top-6 left-4"
        src={image}
      />
      <div className="grid grid-cols-2 p-4 h-20 absolute top-0 left-16 flex justify-end items-center">
        <div className="w-24">
          <h3 className="text-sm">{name}</h3>
          <h3 className="text-xs text-gray-400">
            {items} item
            {items !== 1 && "s"}
          </h3>
        </div>
        <div className="text-right w-24" style={{ color: "var(--primary)" }}>
          <h3 className="text-lg">{winners}</h3>
          <h3 className="text-xs">
            winner
            {winners !== 1 && "s"}
          </h3>
        </div>
      </div>
    </button>
  );
}
