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
}

export default function HeroSection({ data }: { data: SlideData[] }) {
  return (
    <main>
      <section className="w-full relative mb-8 lg:mb-12">
        <div className="relative">
          <Screen>
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: true, // This enables seamless infinite scrolling
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
                    onClick={() => {}}
                  >
                    <div className="relative mx-auto max-w-full aspect-[3/1] bg-cover bg-center rounded-xl overflow-hidden shadow-2xl">
                      {/* Background Image with Overlay */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${slide.image.original})`,
                        }}
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
                        <div className="text-center max-w-4xl px-6 sm:px-8 lg:px-12">
                          {/* Subtitle */}
                          {/* <div
                            className={cn(
                              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 bg-card/80"
                            )}
                          >
                            <Play className="w-3 h-3" />
                            {slide.subtitle}
                          </div> */}

                          {/* Main Title */}
                          <h1
                            className={cn(
                              "text-4xl sm:text-5xl  font-bold mb-6 leading-tight text-balance transition-all duration-500 group-hover:scale-105 bg-card/50 rounded-lg text-secondary-foreground p-2 px-4",
                              slide.theme === "dark" && "text-white",
                              slide.titleClass
                            )}
                          >
                            {slide.name}
                          </h1>

                          {/* Description */}
                          <p
                            className={cn(
                              "text-lg sm:text-xl lg:text-2xl  mb-8 mx-auto leading-relaxed text-pretty transition-all duration-500 bg-card/50 rounded-lg text-secondary-foreground",
                              slide.theme === "dark" && "text-white/90",
                              slide.descriptionClass
                            )}
                          >
                            {slide.description}
                          </p>

                          {slide.buttonText && (
                            <Button
                              size="lg"
                              className={cn(
                                "text-lg px-8 py-6  rounded-full font-semibold transition-all duration-300 group-hover:scale-110 shadow-xl",
                                slide.theme === "dark" &&
                                  "bg-white text-black hover:bg-white/90 hover:shadow-white/20"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                slide.onClick();
                              }}
                            >
                              {slide.buttonText}
                              <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
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
