"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

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
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-300">
                Get the latest updates on new products and upcoming sales
              </p>
            </div>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white text-slate-900 flex-1"
              />
              <Button className="bg-orange-500 hover:bg-orange-600">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">
                <span className="text-orange-400">Electra</span>Bay
              </h2>
              <p className="text-gray-300 mb-6 max-w-md">
                Your premier destination for electronics from trusted vendors
                worldwide. Quality products, competitive prices, and exceptional
                service.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-orange-400" />
                  <span className="text-gray-300">info@electrabay.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-orange-400" />
                  <span className="text-gray-300">+1 234 567 890</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                  <span className="text-gray-300">
                    123 Tech Street, Digital City
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-orange-400 p-2"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-orange-400 p-2"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-orange-400 p-2"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-orange-400 p-2"
                >
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-gray-300 hover:text-orange-400 transition-colors"
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
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 ElectraBay. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-orange-400">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
