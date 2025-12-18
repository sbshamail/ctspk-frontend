import React, { Suspense } from "react";
import WalletPage from "@/@pages/WalletPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";

const page = () => {
  return (
    <Suspense fallback={<LayoutSkeleton main={true} />}>
      <WalletPage />
    </Suspense>
  );
};

export default page;
