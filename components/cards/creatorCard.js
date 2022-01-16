import React from "react";

export default function CreatorCard({
  image,
  username,
  first,
  last,
  followers,
}) {
  return (
    <button
      className="columns-1 w-72 h-80 rounded-lg bg-white text-left relative"
      style={{
        boxShadow: "4px 4px 24px rgba(0, 0, 0, 0.125)",
      }}
    >
      <img
        className="w-36 h-36 rounded-full mt-0 bg-black object-cover absolute top-12"
        style={{ left: "calc(50% - 4.5rem)" }}
        src={image}
      />
      <div className="grid grid-cols-2 p-4 w-full h-24 absolute top-56">
        <div>
          <p className="text-base text-sm font-bold">
            {username}
            <br />
            <span className="text-gray-400 text-xs">
              {first} {last}
            </span>
          </p>
          <div className="flex flex-row">
            <p className="text-xs text-gray-300">Top Creator</p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <div
            className="flex flex-col justify-center items-end"
            style={{ color: "var(--primary)" }}
          >
            <h3 className="text-lg">{followers}</h3>
            <h3 className="text-xs text-right">
              follower
              {followers !== 1 && "s"}
            </h3>
          </div>
        </div>
      </div>
    </button>
  );
}
