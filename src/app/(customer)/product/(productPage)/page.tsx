import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Suspense } from "react";
import ProductPageContent from "./PageContent";
const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton sidebar={true} main={true} />}>
        <ProductPageContent />
      </Suspense>
    </div>
  );
};

export default page;
