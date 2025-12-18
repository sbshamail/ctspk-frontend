import BecomeSellerPage from "@/@pages/BecomeSellerPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import React, { Suspense } from "react";

export const metadata = {
  title: "Become a Seller | CTSPK",
  description: "Create your shop and start selling your products on CTSPK",
};

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <BecomeSellerPage />
      </Suspense>
    </div>
  );
};

export default page;
