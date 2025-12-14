import HeroSection from "@/components/customer/banner/HeroSection";
import ProductSlider from "@/components/customer/slider/ProductSlider";
import { fetchApi } from "@/action/fetchApi";
const page = async () => {
  const fetchBanner = await fetchApi({
    url: "banner/list",
    options: { cache: "no-store" },
  });

  const bannerData = fetchBanner?.data || [];

  return (
    <div className="mt-4">
      <div className="flex flex-col lg:gap-12 gap-8">
        {bannerData?.length > 0 && <HeroSection data={bannerData} />}
        <ProductSlider
          autoplay={false}
          title="Featured Products"
          columnFilters={[["is_feature", true]]}
        />
        <ProductSlider
          autoplay={false}
          title="Gher Tak Trends (under 1000/- Rs.)"
          numberRange={["price", 0, 1000]}
        />
        <ProductSlider autoplay={false} title="Latest Additions" />
        <ProductSlider
          autoplay={false}
          title="Best Seller"
          customEndpoint="product/best-sellers"
        />
      </div>
    </div>
  );
};

export default page;
