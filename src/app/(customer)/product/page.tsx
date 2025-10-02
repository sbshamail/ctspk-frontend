import ProductPage from "@/@pages/ProductPage";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton sidebar={true} main={true} />}>
        <ProductPage />
      </Suspense>
    </div>
  );
};

export default page;
