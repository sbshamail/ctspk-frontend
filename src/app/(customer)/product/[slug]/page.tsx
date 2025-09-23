"use client";
import { Screen } from "@/@core/layout";
import { ProductDetail } from "@/components/customer/ProductDetail";
import ProductSlider from "@/components/customer/slider/ProductSlider";
import { gherTakProducts } from "../../page";

// Mock product data - in a real app, this would come from a database
const products = [
  {
    id: 3,
    title: "Premium Dairy Products",
    images: ["/assets/imgs/p2.jpg", "/assets/imgs/p3.jpeg"],
    rating: 4.0,
    price: 300,
    salePrice: 200,
    reviews: 12,
    sku: "DAIRY-003",
    category: { id: 1, name: "Milks & Dairies" },
    weight: "1kg",
    quota: 5,
    description:
      "Enjoy our Premium Dairy Products sourced from organic farms, ensuring freshness and quality in every bite. Perfect for your daily nutrition needs, these products are carefully selected to provide the best taste and nutritional value for your family.",
  },
];

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.id === Number.parseInt(params.id));
  console.log(params);
  //   if (!product) {
  //     notFound();
  //   }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}
      <Screen>
        <main className="py-10">
          <ProductDetail product={products[0]} />
        </main>
        <div className="shadow p-4 rounded-lg">
          <ProductSlider
            title="You might also like"
            products={gherTakProducts}
          />
        </div>
      </Screen>
      {/* <Footer /> */}
    </div>
  );
}
