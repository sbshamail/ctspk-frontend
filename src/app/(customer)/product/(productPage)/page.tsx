import { Suspense } from "react";
import ProductPageContent from "./PageContent";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductPageContent data={[]} />
      </Suspense>
    </div>
  );
};

export default page;
