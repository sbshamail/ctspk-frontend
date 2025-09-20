"use client";

import { Screen } from "@/@core/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";

const Footer = () => {
  const footerSections = [
    {
      title: "Company Info",
      links: ["About Us", "Contact Us", "Careers", "Press", "Blog"],
    },
    {
      title: "Customer Service",
      links: [
        "Help Center",
        "Track Your Order",
        "Returns & Exchanges",
        "Shipping Info",
        "Size Guide",
      ],
    },
    {
      title: "Quick Links",
      links: ["New Arrivals", "Best Sellers", "Sale", "Gift Cards", "Wishlist"],
    },
  ];

  return (
    <footer className="bg-slate-900 mt-12">
      {/* Newsletter Section */}
      <section className="bg-muted  py-10">
        <Screen>
          <div className=" mx-auto mobile-banner-bg">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="relative mt-10 lg:mt-16 max-w-xl">
                <div className="newsletter-content">
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
                <h2 className="text-2xl font-bold mb-4">
                  <span className="text-primary">GHER &nbsp;</span>
                  <span className="text-gray-300">TAK</span>
                </h2>
                <p className="text-gray-300 mb-6 max-w-md">
                  Your premier destination for electronics from trusted vendors
                  worldwide. Quality products, competitive prices, and
                  exceptional service.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-gray-300">info@ghertak.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-gray-300">
                      (+92) - 540-025-124553
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-gray-300">
                      10:00 - 18:00, Mon - Sat
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-primary p-2"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-primary p-2"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-primary p-2"
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-primary p-2"
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Footer Links */}
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href="#"
                          className="text-gray-300 hover:text-primary transition-colors"
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

      <div className="border-t border-slate-700 fixed bottom-0 bg-slate-900    w-full h-6 py-6">
        <Screen>
          <div className=" mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-300 text-sm">
                © 2025 GHER TAK. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm md:mt-0">
                <a href="#" className="text-gray-300 hover:text-primary">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-300 hover:text-primary">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-300 hover:text-primary">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </Screen>
      </div>
    </footer>
  );
};

export default Footer;
