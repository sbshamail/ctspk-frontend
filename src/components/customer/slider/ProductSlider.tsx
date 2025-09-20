"use client";
import { Screen } from "@/@core/layout";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 5;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };
  return (
    <Screen>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-secondary-foreground">
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="h-10 w-10 p-0 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="h-10 w-10 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {/* <div className=" mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 "> */}
          {products.map((item, index) => {
            return (
              <div
                className="xl:w-1/5 lg:w-1/4 md:w:1/3 w:1/2 flex-shrink-0 px-2"
                key={index}
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
              </div>
            );
          })}
          {/* </div> */}
        </div>
      </div>
    </Screen>
  );
};

export default ProductSlider;
