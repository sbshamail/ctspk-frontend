import ProfilePage from "@/@pages/ProfilePage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <ProfilePage />
      </Suspense>
    </div>
  );
};

export default page;
