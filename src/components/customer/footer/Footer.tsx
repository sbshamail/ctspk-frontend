"use client";

import { Screen } from "@/@core/layout";
import { Clock, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { DesktopBottomBar } from "./DesktopBottomBar";
import { MobileBottomBar } from "./MobileBottomBar";
import { useSelection } from "@/lib/useSelection";
import { useState } from "react";
import SiginModal from "@/components/modals/auth/SiginModal";
// Define types for the link items
interface FooterLink {
  name: string;
  link: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer = () => {
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");

  const renderLink = (item: FooterLink) => {
    if (item.link === "special://signin") {
      // Don't show Sign In if authenticated or still loading
      if (auth || isLoading) {
        return null;
      }
      return (
        <button
          onClick={() => setOpenSiginModal(true)}
          className="text-base text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          {item.name}
        </button>
      );
    }

    return (
      <a
        href={item.link}
        className="text-base text-foreground hover:text-primary transition-colors"
      >
        {item.name}
      </a>
    );
  };

  const footerSections: FooterSection[] = [
    {
      title: "About Us",
      links: [
        { name: "About Us", link: "/about" },
        { name: "Contact Us", link: "/contact" },
        
        { name: "Customer Support", link: "/support" },
      ],
    },
    {
      title: "Information",
      links: [
        { name: "Privacy Policy", link: "/privacy" },
        { name: "Terms & Conditions", link: "/terms" },
        { name: "Returns Policy", link: "/returns" },
        { name: "Sitemap", link: "/sitemap" },
      ],
    },
    {
      title: "Account",
      links: [
        { name: "Sign In", link: "special://signin" },
        { name: "View Cart", link: "/cart" },
        { name: "My Wishlist", link: "/wishlist" },
        { name: "Track My Order", link: "/track-order" },
      ],
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

                <p className="text-foreground mb-6 max-w-md">
                  If you are a thinker, builder, or doer who sees complexity as
                  a challenge worth simplifying, you will find your calling
                  here. Together, we build a workplace powered by Ease,
                  Reliability, and Ownership, where every saver leaves a mark on
                  the way Pakistan shops, connects, and lives.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-foreground">info@ghertak.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-foreground">
                      (+971) - 52-993-2054
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
                  <h4 className="font-semibold text-lg lg:text-xl mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((item, linkIndex) => {
                      // Skip rendering Sign In link if user is authenticated or loading
                      if (
                        item.link === "special://signin" &&
                        (auth || isLoading)
                      ) {
                        return null;
                      }
                      return <li key={linkIndex}>{renderLink(item)}</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Screen>
      </div>

      {/* Bottom Bar */}
      <div>
        <div className="hidden lg:block">
          {" "}
          <DesktopBottomBar />
        </div>
        <div className="block lg:hidden">
          <MobileBottomBar />
        </div>
      </div>

      {/* Add the SiginModal component here */}
      <SiginModal open={openSiginModal} setOpen={setOpenSiginModal} />
    </footer>
  );
};

export default Footer;
