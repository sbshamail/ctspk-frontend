import Contactus from "@/@pages/contactus";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <Contactus />
      </Suspense>
    </div>
  );
};

export default page;
