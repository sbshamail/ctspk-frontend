// @ts-nocheck
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Screen } from "@/@core/layout";
import { MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

export default function HeroSection() {
  const slides = [
    {
      image: "/assets/banner/unnamed3.png",
    },
    {
      image: "/assets/banner/unnamed3.png",
    },
    {
      image: "/assets/banner/unnamed3.png",
    },
  ];
  return (
    <main>
      <section className="w-full relative mb-8 lg:mb-12 ">
        <div className="relative">
          <Screen>
            <Carousel
              className="w-full "
              style={
                {
                  // clipPath:
                  //   "polygon(20% 0%, 0% 20%, 14% 49%, 0% 80%, 20% 100%, 51% 98%, 80% 100%, 100% 80%, 82% 46%, 100% 20%, 80% 0%, 49% 4%)",
                }
              }
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: false,
                }),
              ]}
            >
              <CarouselContent>
                {slides.map((slide, idx) => {
                  const prevIndex = (idx - 1 + slides.length) % slides.length;
                  const nextIndex = (idx + 1) % slides.length;

                  return (
                    <CarouselItem key={idx} className="relative ">
                      {/* Left peek  */}
                      {/* <div
                        className="absolute left-0 top-0 h-full w-1/8 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${slides[prevIndex].image})`,
                        }}
                      >
                      
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-r-lg shadow-inner" />
                      </div>{" "} */}
                      {/* Main center image */}
                      <div
                        className="relative mx-auto max-w-full aspect-[3/1] bg-cover bg-center rounded-lg z-10"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      />

                      {/* <div
                        className="absolute right-0 top-0 h-full w-1/8  bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${slides[nextIndex].image})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-r-lg shadow-inner" />
                      </div> */}
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </Screen>
        </div>
      </section>
    </main>
  );
}
