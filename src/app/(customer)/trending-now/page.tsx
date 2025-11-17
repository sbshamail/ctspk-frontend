import { Screen } from "@/@core/layout";
import TrendPage from "@/@pages/TrendPage";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Screen>
        <Suspense fallback={<LayoutSkeleton sidebar={true} main={true} />}>
          <TrendPage />
        </Suspense>
      </Screen>
    </div>
  );
};

export default page;
