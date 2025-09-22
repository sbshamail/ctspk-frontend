"use client";

import * as React from "react";
import { Screen } from "@/@core/layout";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface Product {
  id?: number;
  name: string;
  image: string;
  rating: number;
  price: number;
  salePrice?: number;
  link?: string;
}
interface ProductCarouselProps {
  title: string;
  products: Product[];
  className?: string;
}

const ProductSlider = ({
  title,
  products,
  className,
}: ProductCarouselProps) => {
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

  return (
    <Screen>
      <div className="flex justify-between items-center mb-4">
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
          {products.map((item, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 "
            >
              <ProductCard
                title={item.name}
                link={item.link ?? "/product/2"}
                image={item.image}
                rating={item.rating}
                price={item.price}
                salePrice={item.salePrice}
                showPercentage
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </Screen>
  );
};

export default ProductSlider;
