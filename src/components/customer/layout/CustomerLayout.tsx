import { Suspense } from "react";
// Components
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Footer from "./Footer";
// Types
import { ChildrenType } from "@/utils/reactTypes";
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
