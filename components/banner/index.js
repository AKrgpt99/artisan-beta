import React from "react";

export default function Banner({ title, subtitle, ctaButtons, children }) {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 w-full sm:px-8 md:px-18 lg:px-36">
      <div className="flex flex-col justify-center items-center sm:my-12 sm:mx-4">
        <div className="w-full p-4">
          <h1 className="text-2xl text-gray-600 font-black mb-8">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
        </div>
        <div className="w-full p-4">{ctaButtons}</div>
      </div>
      <div className="flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
}
