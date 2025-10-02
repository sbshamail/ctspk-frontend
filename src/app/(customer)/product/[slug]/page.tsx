import { Screen } from "@/@core/layout";
import { ProductDetail } from "@/components/customer/ProductDetail";
import ProductSlider from "@/components/customer/slider/ProductSlider";

import { fetchApi } from "@/action/fetchApi";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function page({ params }: ProductPageProps) {
  console.log(params.slug);
  const product = await fetchApi({
    url: `product/read/${params.slug}`,
    options: { cache: "no-store" }, // fresh each request
  });
  const breadcrumbData = [
    { link: "/", name: "Home" },
    { link: "/product", name: "Product" },
    { name: product?.data?.name },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-10" />
        <main className="">
          <ProductDetail product={product.data} />
        </main>
        <div className="shadow p-4 rounded-lg">
          <ProductSlider title="You might also like" />
        </div>
      </Screen>
    </div>
  );
}
