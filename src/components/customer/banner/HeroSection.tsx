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

export default function HeroSection() {
  const slides = [
    {
      image: "/assets/imgs/home-banner1.jpg",
      title: "Fresh Vegetables Big Discount",
      subtitle: "Save up to 50% off on your first order",
    },
    // {
    //   image: "/assets/imgs/home-side-banner3.jpg",
    //   title: "Quality Freshness Guaranteed!",
    //   subtitle: "Best deals on organic groceries",
    // },
  ];
  return (
    <main>
      <section className="w-full relative mb-8 lg:mb-12 ">
        <div className="relative  overflow-hidden ">
          <Carousel className="w-full">
            <CarouselContent>
              {slides.map((slide, idx) => (
                <CarouselItem key={idx}>
                  {/* Set height to show full banner */}
                  <div className=" relative w-full h-[201px]    overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={idx === 0}
                      className="w-full object-fill object-center"
                    />

                    {/* Overlay (optional) */}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Text Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-12">
                      <h1 className="text-3xl text-center lg:text-5xl font-bold text-black/70 mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-lg text-center text-black/90">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>
      <Screen>
        <section className="relative ">
          <div className=" mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-12 lg:gap-6 ">
              {/* Left Hero Slider */}
              <div className="xl:col-span-8 ">
                <div
                  className="relative h-[408px] mt-8 lg:mt-12  rounded-lg overflow-hidden bg-cover bg-no-repeat bg-center "
                  style={{
                    backgroundImage:
                      "url('/assets/imgs/home-side-banner3.jpg')",
                  }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 p-8 lg:p-12 text-black/70">
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                      Quality <br /> Freshness <br /> Guaranteed!
                    </h1>
                    <p className="mb-6 text-lg ">
                      Save up to 50% off on <br /> your first order
                    </p>
                    <div>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition"
                      >
                        Shop Now
                        <MoveRight className="text-primary-foreground/80" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Banners */}
              <div className="xl:col-span-4 flex flex-col lg:justify-between gap-6 mt-8 lg:mt-12 lg:h-[408px]">
                {/* Banner 1 */}
                <div className="relative rounded-lg overflow-hidden ">
                  <Image
                    src="/assets/imgs/home-side-banner1.jpg"
                    alt="Fresh Products"
                    width={400}
                    height={500}
                    className="w-full xl:h-[180px] h-auto object-cover  "
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-center text-black/70">
                    <h4 className="xl:text-xl text-lg font-semibold mb-4">
                      Everyday Fresh &amp; <br /> Clean with Our <br /> Products
                    </h4>
                    <div>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 lg:py-2 py-1 rounded-md text-sm font-medium hover:bg-primary/90 transition"
                      >
                        Shop Now
                        <MoveRight className="text-primary-foreground/80" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Banner 2 */}
                <div className="relative rounded-lg overflow-hidden ">
                  <Image
                    src="/assets/imgs/home-side-banner2.jpg"
                    alt="Fresh Products"
                    width={400}
                    height={500}
                    className="w-full xl:h-[180px] h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-center text-black/70">
                    <h4 className="xl:text-xl text-lg font-semibold mb-4">
                      Everyday Fresh &amp; <br /> Clean with Our <br /> Products
                    </h4>
                    <div>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 lg:py-2 py-1 rounded-md text-sm font-medium hover:bg-primary/90 transition"
                      >
                        Shop Now
                        <MoveRight className="text-primary-foreground/80" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Screen>
    </main>
  );
}
