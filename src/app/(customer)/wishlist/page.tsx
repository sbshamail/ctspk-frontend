import WishlistPage from "@/@pages/Wishlist";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<LayoutSkeleton main={true} />}>
        <WishlistPage />
      </Suspense>
    </div>
  );
};

export default page;
