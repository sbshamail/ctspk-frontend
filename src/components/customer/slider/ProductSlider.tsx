"use client";

import { Screen } from "@/@core/layout";
import ProductCardSkeleton from "@/components/loaders/ProductCardSkeleton";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  useGetProductsQuery,
  ProductQueryParams,
} from "@/store/services/productApi";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

interface ProductCarouselProps extends ProductQueryParams {
  title: string;
  className?: string;
}

const defaultLimit = 10;
const ProductSlider = ({
  title,
  className,
  page = 1,
  limit = defaultLimit,
  columnFilters,
  numberRange,
}: ProductCarouselProps) => {
  const { data, error, isLoading } = useGetProductsQuery({
    page,
    limit,
    columnFilters,
    numberRange,
  });
  const products = data?.data;
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const productSkeleton = () =>
    Array(defaultLimit)
      .fill(null)
      .map((_, index) => <ProductCardSkeleton key={index} />);

  return (
    <Screen>
      <div className={cn("flex justify-between items-center mb-4", className)}>
        <h3 className="text-2xl lg:text-3xl font-bold text-secondary-foreground">
          {title}
        </h3>

        {/* ✅ Custom nav + status */}
        <div className="flex items-center gap-4">
          {/* <span className="text-sm text-muted-foreground">
            {current} / {count}
          </span> */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi} // ✅ pass setter so api is captured
      >
        <CarouselContent>
          {isLoading
            ? // 🔹 Show skeletons during loading
              Array(defaultLimit)
                .fill(null)
                .map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <ProductCardSkeleton />
                  </CarouselItem>
                ))
            : // 🔹 Render products once loaded
              products?.map((item, index) => (
                <CarouselItem
                  key={item.id ?? index}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <ProductCard {...item} showPercentage={true} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </Screen>
  );
};

export default ProductSlider;
