import React from "react";

function GridSection({ title, children, smCols, mdCols, lgCols }) {
  return (
    <div className="flex flex-col justify-center items-center w-full p-4">
      <div className="w-full text-center">
        <h2 className="text-xl py-2 text-gray-600 mt-12">{title}</h2>
      </div>
      <div className="w-full flex justify-center items-center sm:px-8 md:px-12 lg:px-24 mt-6">
        <div
          className={`grid sm:grid-cols-${smCols} md:grid-cols-${mdCols} lg:grid-cols-${lgCols} gap-8 py-4`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

GridSection.defaultProps = {
  smCols: 1,
  mdCols: 2,
  lgCols: 3,
};

export default GridSection;
