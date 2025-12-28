// Components

import Footer from "../footer/Footer";
// Types
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { ChildrenType } from "@/utils/reactTypes";
import { Suspense } from "react";
import Header from "./Header";
import PromoPopupWrapper from "@/components/popup/PromoPopupWrapper";

type Props = {
  children: ChildrenType;
};
const CustomerLayout = ({ children }: Props) => {
  return (
    <div className="pb-16 lg:pb-0">
      <Suspense fallback={<LayoutSkeleton header={true} />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
      {/* Promo Popup - Shows once per day based on settings */}
      <PromoPopupWrapper />
    </div>
  );
};

export default CustomerLayout;
