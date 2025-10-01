import { Suspense } from "react";
// Components
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Footer from "./Footer";
// Types
import { fetchApi } from "@/action/fetchApi";
import { ChildrenType } from "@/utils/reactTypes";
import Header from "./Header";
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
