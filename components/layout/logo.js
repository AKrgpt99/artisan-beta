import React from "react";
import Image from "next/image";

export default function Logo() {
  return (
    <button className="flex justify-start items-center">
      <div className="flex-64">
        <Image
          src="https://artisancoin.io/wp-content/uploads/2021/12/Group-16269.png"
          width={64}
          height={64}
        />
      </div>
      <div className="flex-64 ml-4">
        <h1 className="text-2xl title-ac">Artisan</h1>
        <p className="text-xs font-bold text-gray-300">MARKETPLACE</p>
      </div>
    </button>
  );
}
