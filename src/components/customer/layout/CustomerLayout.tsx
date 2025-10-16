// Components

import Footer from "../footer/Footer";
// Types
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { ChildrenType } from "@/utils/reactTypes";
import { Suspense } from "react";
import Header from "./Header";
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
