import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

import EthereumLogo from "./ethereum.svg";

export default function Card({ image, itemId, name, username, price, likes }) {
  return (
    <button
      className="columns-1 w-72 h-80 rounded-lg bg-white text-left relative"
      style={{
        boxShadow: "4px 4px 24px rgba(0, 0, 0, 0.125)",
      }}
    >
      <img
        className="w-full h-56 rounded-t-lg mt-0 bg-black object-cover absolute top-0 left-0"
        src={image}
      />
      <div className="grid grid-cols-2 p-4 w-full h-24 absolute top-56">
        <div>
          <h3 className="text-base">
            {name} <span className="text-gray-400">#{itemId}</span>
          </h3>
          <div className="flex flex-row">
            <p className="text-xs text-gray-400 mr-1">Creator</p>
            <p className="text-xs" style={{ color: "var(--primary)" }}>
              {username}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <div className="flex flex-row justify-center items-center mb-1">
            <img width={20} src={EthereumLogo} className="mr-0.5" />
            <h3>{price}</h3>
          </div>
          <div className="flex flex-row justify-center items-center">
            <FontAwesomeIcon
              icon={faHeart}
              style={{ color: "var(--primary)" }}
              className="mr-1"
            />
            <h3 style={{ color: "var(--primary)" }}>{likes}</h3>
          </div>
        </div>
      </div>
    </button>
  );
}
