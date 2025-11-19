import { Screen } from "@/@core/layout";
import { ProductDetail } from "@/components/customer/ProductDetail";
import ProductSlider from "@/components/customer/slider/ProductSlider";
import { fetchApi } from "@/action/fetchApi";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function page({ params }: ProductPageProps) {
  let product;
  
  try {
    product = await fetchApi({
      url: `product/read/${params.slug}`,
      options: { cache: "no-store" },
    });

    if (!product?.data) {
      notFound();
    }

  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  const breadcrumbData = [
    { link: "/", name: "Home" },
    { link: "/product", name: "Product" },
    { name: product.data.name },
  ];

  // Get category ID for related products
  // Try multiple possible category field paths
  const categoryId =
    product.data.category_id ||
    product.data.category?.id ||
    product.data.category?.root_id;

  console.log('Product category data:', {
    category_id: product.data.category_id,
    category: product.data.category,
    selectedId: categoryId
  });

  return (
    <div className="min-h-screen bg-background">
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-10" />
        <main className="">
          <ProductDetail product={product.data} />
        </main>
        <div className="shadow p-4 rounded-lg mt-8">
          {categoryId ? (
            <ProductSlider
              title="You might also like"
              columnFilters={[["category_id", categoryId]]}
              limit={10}
            />
          ) : (
            <ProductSlider title="You might also like" limit={10} />
          )}
        </div>
      </Screen>
    </div>
  );
}