import { Screen } from "@/@core/layout";
import HeroSection from "@/components/customer/banner/HeroSection";
import ProductSlider from "@/components/customer/slider/ProductSlider";
const page = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Seeds of Change Organic Quinoa, Brown, & Red Rice",
      image: "/assets/imgs/p1.png",
      rating: 4.0,
      price: 300,
    },
    {
      id: 2,
      name: "Fresh Organic Vegetables Bundle",
      image: "/assets/imgs/p2.jpg",
      rating: 4.0,
      price: 200,
      salePrice: 100,
    },
    {
      id: 3,
      name: "Premium Dairy Products",
      image: "/assets/imgs/p3.jpeg",
      rating: 4.0,
      price: 300,
      salePrice: 200,
    },
    {
      id: 4,
      name: "Artisan Bread Collection",
      image: "/assets/imgs/p4.jpg",
      rating: 4.0,
      price: 500,
      salePrice: 400,
    },
    {
      id: 5,
      name: "Seasonal Fruit Basket",
      image: "/assets/imgs/p5.png",
      rating: 4.0,
      price: 200,
    },
    {
      id: 6,
      name: "Organic Meat Selection",
      image: "/assets/imgs/p6.jpg",
      rating: 4.0,
      price: 100,
    },
    {
      id: 7,
      name: "Gourmet Spices & Herbs",
      image: "/assets/imgs/p7.png",
      rating: 4.0,
      price: 500,
    },
  ];

  const gherTakProducts = [
    {
      id: 1,
      name: "Seeds of Change Organic Quinoa, Brown, & Red Rice",
      image: "/assets/imgs/p1.png",
      rating: 4.0,
      price: 300,
    },
    {
      id: 2,
      name: "Fresh Organic Vegetables Bundle",
      image: "/assets/imgs/p6.jpg",
      rating: 4.0,
      price: 200,
      salePrice: 100,
    },
    {
      id: 3,
      name: "Premium Dairy Products",
      image: "/assets/imgs/p8.png",
      rating: 4.0,
      price: 300,
      salePrice: 200,
    },
    {
      id: 4,
      name: "Artisan Bread Collection",
      image: "/assets/imgs/p9.jpeg",
      rating: 4.0,
      price: 500,
      salePrice: 400,
    },
    {
      id: 5,
      name: "Seasonal Fruit Basket",
      image: "/assets/imgs/p10.png",
      rating: 4.0,
      price: 200,
    },
    {
      id: 6,
      name: "Organic Meat Selection",
      image: "/assets/imgs/p11.png",
      rating: 4.0,
      price: 100,
    },
    {
      id: 7,
      name: "Gourmet Spices & Herbs",
      image: "/assets/imgs/p12.png",
      rating: 4.0,
      price: 500,
    },
  ];

  const latestEdition = [
    {
      id: 1,
      name: "Seeds of Change Organic Quinoa, Brown, & Red Rice",
      image: "/assets/imgs/p1.png",
      rating: 4.0,
      price: 300,
    },
    {
      id: 2,
      name: "Fresh Organic Vegetables Bundle",
      image: "/assets/imgs/p14.png",
      rating: 4.0,
      price: 200,
      salePrice: 100,
    },
    {
      id: 3,
      name: "Premium Dairy Products",
      image: "/assets/imgs/p15.jpg",
      rating: 4.0,
      price: 300,
      salePrice: 200,
    },
    {
      id: 4,
      name: "Artisan Bread Collection",
      image: "/assets/imgs/p16.jpeg",
      rating: 4.0,
      price: 500,
      salePrice: 400,
    },
    {
      id: 5,
      name: "Seasonal Fruit Basket",
      image: "/assets/imgs/p12.png",
      rating: 4.0,
      price: 200,
    },
    {
      id: 6,
      name: "Organic Meat Selection sdfsd sdfsdf sdfsd",
      image: "/assets/imgs/p18.jpg",
      rating: 4.0,
      price: 100,
    },
  ];

  return (
    <div className="mt-4">
      <div className="flex flex-col lg:gap-12 gap-8">
        <HeroSection />
        <ProductSlider title="Featured Products" products={featuredProducts} />
        <ProductSlider title="Gher Tak Trends" products={gherTakProducts} />
        <ProductSlider title="Latest Additions" products={latestEdition} />
      </div>
    </div>
  );
};

export default page;
