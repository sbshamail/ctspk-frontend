"use client";

import { Screen } from "@/@core/layout";
import SocialIcons from "@/components/icons/SocialIcons";
import { MainLogo } from "@/components/logo/MainLogo";
import { Clock, Mail, Phone } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  const footerSections = [
    {
      title: "About Us",
      links: ["About Us", "Contact Us", "About team", "Customer Support"],
    },
    {
      title: "Information",
      links: [
        "Privacy Policy",
        "Terms & Conditions",
        "Returns Policy",
        "Sitemap",
      ],
    },
    {
      title: "Account",
      links: ["Sign In", "View Cart", "My Wishlist", "Track My Order"],
    },
  ];

  return (
    <footer className=" mt-12">
      {/* Newsletter Section */}
      <section className="bg-muted ">
        <Screen>
          <div
            className=" py-8 bg-contain bg-no-repeat bg-right"
            style={{
              backgroundImage: "url('/assets/imgs/mobile-banner-visual.jpg')",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="relative">
                <div className="newsletter-content max-w-lg">
                  <h2 className="mb-6 text-2xl md:text-3xl lg:text-4xl font-bold leading-snug">
                    Make your online shop experience easier with our mobile app
                  </h2>
                  <p className="mb-10 text-muted-foreground">
                    Gher Tak makes online grocery shopping fast and easy. Get
                    groceries delivered and order the best of the season right
                    here.
                  </p>

                  {/* Download App Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="#" className="hover:opacity-90 transition">
                      <Image
                        src="/assets/imgs/theme/app-store.jpg"
                        alt="App Store"
                        width={150}
                        height={50}
                        className="rounded-md"
                      />
                    </a>
                    <a href="#" className="hover:opacity-90 transition">
                      <Image
                        src="/assets/imgs/theme/google-play.jpg"
                        alt="Google Play"
                        width={150}
                        height={50}
                        className="rounded-md"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Screen>
      </section>

      {/* Main Footer */}
      <div className="py-12 text-primary">
        <Screen>
          <div className=" px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                {/* Logo */}
                <MainLogo className="mb-4 max-w-full" />
                <p className="text-foreground mb-6 max-w-md">
                  Your premier destination for electronics from trusted vendors
                  worldwide. Quality products, competitive prices, and
                  exceptional service.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-foreground">info@ghertak.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-foreground">
                      (+92) - 540-025-124553
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-foreground">
                      10:00 - 18:00, Mon - Sat
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg lg:text-xl mb-4 ">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href="#"
                          className="text-base text-foreground hover:text-primary transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Screen>
      </div>

      {/* Bottom Bar */}

      <div className=" py-2  border-t border-border md:fixed md:bottom-0 w-full z-50 bg-background">
        <Screen>
          <div className="md:h-10  w-full flex items-center  mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="w-full flex flex-col gap-6 md:flex-row justify-between items-center">
              <div className="text-foreground text-sm">
                © 2025 GHER TAK. All rights reserved.
              </div>
              <div className="flex space-x-12 text-sm md:mt-0 flex-col md:flex-row gap-6">
                <SocialIcons />
                <div className=" h-full">
                  <Image
                    src="/assets/imgs/cards.png"
                    alt="banks"
                    height={200}
                    width={200}
                  />
                </div>
              </div>
            </div>
          </div>
        </Screen>
      </div>
    </footer>
  );
};

export default Footer;
