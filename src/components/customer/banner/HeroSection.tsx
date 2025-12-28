"use client";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Screen } from "@/@core/layout";
import { Button } from "@/components/ui/button";
import { ImageType } from "@/utils/modelTypes";
import { ClassNameType } from "@/utils/reactTypes";
import Autoplay from "embla-carousel-autoplay";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SlideData {
  id: number;
  image: ImageType;
  name?: string;
  description?: string;
  slug?: string;
  titleClass?: ClassNameType;
  subtitle?: string;
  descriptionClass?: ClassNameType;
  buttonText?: string;
  onClick: () => void;
  theme?: "light" | "dark";
  category_id?: number | null;
  category?: {
    id: number;
    root_id: number;
    name: string;
    slug: string;
    // ... other category properties
  } | null;
}

export default function HeroSection({ data }: { data: SlideData[] }) {
  const router = useRouter();

  const handleSlideClick = (slide: SlideData) => {
    // If category exists, navigate to products with category filter
    if (slide.category?.root_id) {
      const columnFilters = JSON.stringify([["category.root_id", slide.category.root_id]]);
      const encodedFilters = encodeURIComponent(columnFilters);
      router.push(`/product?columnFilters=${encodedFilters}`);
    } else if (slide.category_id) {
      // Fallback to category_id if root_id is not available
      const columnFilters = JSON.stringify([["category_id", slide.category_id]]);
      const encodedFilters = encodeURIComponent(columnFilters);
      router.push(`/product?columnFilters=${encodedFilters}`);
    } else {
      // Default behavior if no category
      slide.onClick();
    }
  };

  const handleButtonClick = (slide: SlideData, e: React.MouseEvent) => {
    e.stopPropagation();
    handleSlideClick(slide);
  };

  return (
    <main>
      <section className="w-full relative mb-8 lg:mb-12">
        <div className="relative">
          <Screen>
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
                dragFree: false,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
            >
              <CarouselContent className="-ml-0">
                {data?.map((slide) => (
                  <CarouselItem
                    key={slide.id}
                    className="relative pl-0 cursor-pointer group"
                    onClick={() => handleSlideClick(slide)}
                  >
                    <div className="relative mx-auto max-w-full rounded-xl overflow-hidden shadow-2xl">
                      {/* Background Image */}
                      <img
                        src={slide.image.original}
                        alt={slide.name || "Banner"}
                        className="w-full h-auto max-h-[150px] sm:max-h-[220px] md:max-h-[300px] lg:max-h-[350px] object-contain transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Gradient Overlay */}
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity duration-500",
                          slide.theme === "dark" &&
                            "bg-gradient-to-r from-black/70 via-black/50 to-transparent"
                        )}
                      />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center max-w-4xl px-2 sm:px-6 lg:px-12">
                          {/* Main Title */}
                          <h1
                            className={cn(
                              "text-[10px] min-[360px]:text-xs sm:text-lg md:text-2xl lg:text-4xl font-bold mb-1 sm:mb-3 md:mb-5 leading-tight text-balance transition-all duration-500 group-hover:scale-105 bg-card/50 rounded text-secondary-foreground p-0.5 sm:p-1 md:p-2 px-1 sm:px-3",
                              slide.theme === "dark" && "text-white",
                              slide.titleClass
                            )}
                          >
                            {slide.name}
                          </h1>

                          {/* Description - Hidden on small mobile */}
                          <p
                            className={cn(
                              "text-[8px] min-[360px]:text-[10px] sm:text-sm md:text-base lg:text-xl mb-2 sm:mb-4 md:mb-6 mx-auto leading-relaxed text-pretty transition-all duration-500 bg-card/50 rounded text-secondary-foreground hidden min-[360px]:block",
                              slide.theme === "dark" && "text-white/90",
                              slide.descriptionClass
                            )}
                          >
                            {slide.description}
                          </p>

                          {slide.buttonText && (
                            <Button
                              size="sm"
                              className={cn(
                                "text-[8px] min-[360px]:text-[10px] sm:text-xs md:text-sm px-2 min-[360px]:px-3 sm:px-5 md:px-6 py-1 min-[360px]:py-1.5 sm:py-2 md:py-3 h-auto rounded-full font-semibold transition-all duration-300 group-hover:scale-110 shadow-lg",
                                slide.theme === "dark" &&
                                  "bg-white text-black hover:bg-white/90 hover:shadow-white/20"
                              )}
                              onClick={(e) => handleButtonClick(slide, e)}
                            >
                              {slide.buttonText}
                              <ChevronRight className="ml-0.5 sm:ml-1 w-2 h-2 min-[360px]:w-2.5 min-[360px]:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-4 right-4 opacity-30">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            slide.theme === "dark" && "bg-white"
                          )}
                        />
                      </div>
                      <div className="absolute bottom-4 left-4 opacity-30">
                        <div
                          className={cn(
                            "w-1 h-1 rounded-full animate-pulse delay-500",
                            slide.theme === "dark" && "bg-white"
                          )}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </Screen>
        </div>
      </section>
    </main>
  );
}