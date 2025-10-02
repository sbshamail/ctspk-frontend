// Components

import Footer from "./Footer";
// Types
import { ChildrenType } from "@/utils/reactTypes";
import Header from "./Header";
import { Suspense } from "react";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
type Props = {
  children: ChildrenType;
};
const CustomerLayout = ({ children }: Props) => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton header={true} />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
