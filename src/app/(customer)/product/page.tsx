import { Screen } from "@/@core/layout";
import ProductPage from "@/@pages/ProductPage";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Separator />
      <Screen>
        <Suspense fallback={<LayoutSkeleton sidebar={true} main={true} />}>
          <ProductPage />
        </Suspense>
      </Screen>
    </div>
  );
};

export default page;
