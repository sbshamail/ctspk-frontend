import React, { Suspense } from "react";
import NotificationsPage from "@/@pages/NotificationsPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";

const page = () => {
  return (
    <Suspense fallback={<LayoutSkeleton main={true} />}>
      <NotificationsPage />
    </Suspense>
  );
};

export default page;
