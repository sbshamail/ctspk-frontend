import HeroSection from "@/components/customer/banner/HeroSection";
import ProductSlider from "@/components/customer/slider/ProductSlider";

const page = () => {
  return (
    <div className="mt-4">
      <div className="flex flex-col lg:gap-12 gap-8">
        <HeroSection />
        <ProductSlider
          title="Featured Products"
          columnFilters={[["is_feature", true]]}
        />
        <ProductSlider
          title="Gher Tak Trends (under 1000/- Rs)"
          numberRange={["price", 0, 1000]}
        />
        <ProductSlider title="Latest Additions" />
      </div>
    </div>
  );
};

export default page;
