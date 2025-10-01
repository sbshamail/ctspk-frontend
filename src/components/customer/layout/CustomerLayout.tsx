import { Suspense } from "react";
// Components
import Footer from "./Footer";
import Header from "./Header";
import { fetchApi } from "@/action/fetchApi";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
// Types
import { ChildrenType } from "@/utils/reactTypes";
type Props = {
  children: ChildrenType;
};
const CustomerLayout = async ({ children }: Props) => {
  const category = await fetchApi({
    url: `category/list`,
  });

  return (
    <div>
      <Suspense fallback={<LayoutSkeleton header={true} />}>
        <Header categories={category?.data} />
      </Suspense>
      {children}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
