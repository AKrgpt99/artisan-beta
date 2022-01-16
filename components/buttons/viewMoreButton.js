import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function ViewMoreButton() {
  return (
    <button className="flex flex-col justify-center items-center">
      <div
        className="w-24 h-24 flex justify-center items-center rounded-full"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <FontAwesomeIcon icon={faArrowRight} color="white" className="fa-lg" />
      </div>
      <p className="mt-4 text-gray-400 text-sm">View more</p>
    </button>
  );
}
