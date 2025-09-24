import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className=" border border-border shadow rounded-md max-w-sm w-full mx-auto">
      <div className="animate-pulse">
        <div className="relative ">
          <div className="h-56 w-full py-2 ">
            <div className="mt-16 px-10 space-y-2">
              <div className="h-2 bg-effect-md rounded col-span-2"></div>
              <div className="h-2 bg-effect-md rounded col-span-2"></div>
              <div className="h-2 bg-effect-md rounded col-span-2"></div>
              <div className="h-2 bg-effect-md rounded col-span-2"></div>
              <div className="h-2 bg-effect-md rounded col-span-2"></div>
              <div className="h-2 bg-effect-md rounded col-span-2"></div>
            </div>
          </div>
          <div className="absolute  left-0 top-0 mt-3">
            <div className="h-2 bg-effect-md rounded col-span-2 w-8"></div>
          </div>

          <div className="absolute right-0 top-0 m-2 z-10 ">
            <div className="flex space-x-1 ">
              <div className="h-2 bg-effect-md rounded col-span-2 w-6"></div>
              <div className="h-2 bg-effect-md rounded col-span-2 w-6"></div>
              <div className="h-2 bg-effect-md rounded col-span-2 w-6"></div>
            </div>
          </div>
        </div>
        <div className="p-2 bg-card ">
          <div className="h-2 bg-effect-md rounded col-span-2"></div>
          <div className="w-full flex items-center justify-between ">
            <div className="w-full flex flex-col mt-2 space-y-2">
              <div>
                <div className="h-2 bg-effect-md rounded col-span-2 w-12"></div>
              </div>
              <div className="w-full flex justify-between">
                <div className="h-2 bg-effect-md rounded col-span-2 w-12"></div>
              </div>
            </div>
            <div className="z-10">
              <div className="h-2 bg-effect-md rounded col-span-2 w-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
