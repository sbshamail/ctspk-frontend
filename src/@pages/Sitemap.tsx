"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/sitemap", name: "Sitemap" },
];

const SitemapPage = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["main", "products", "support"])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sitemapData = [
    {
      id: "main",
      title: "Main Pages",
      icon: "??",
      pages: [
        { name: "Home", path: "/", description: "Welcome to our store" },
        { name: "About Us", path: "/about", description: "Learn about our company" },
        { name: "Contact Us", path: "/contact", description: "Get in touch with our team" },
        { name: "Sitemap", path: "/sitemap", description: "Complete website overview" },
      ]
    },
    {
      id: "products",
      title: "Products & Shopping",
      icon: "???",
      pages: [
        { name: "All Products", path: "/product", description: "Browse our complete catalog" },
        { name: "New Arrivals", path: "/new-arrivals", description: "Latest products" },
        { name: "Best Sellers", path: "/best-sellers", description: "Most popular items" },
        { name: "Sale & Deals", path: "/sales", description: "Special offers and discounts" },
        { name: "Limited Edition", path: "/limited-edition", description: "Shop by low stock" },
        { name: "Trending Now", path: "/trending-now", description: "Shop by most sales product" },
      ]
    },
    {
      id: "account",
      title: "Account & Orders",
      icon: "??",
      pages: [
        { name: "My Profiles", path: "/profiles", description: "Sign in to your account" },
        { name: "Notification", path: "/notifications", description: "Create a new account" },
        { name: "Cart", path: "/cart", description: "Manage your account" },
        { name: "Order History", path: "/my-orders", description: "View your past orders" },
        { name: "Wishlist", path: "/wishlist", description: "Your saved items" },
        { name: "Address Book", path: "/account/addresses", description: "Manage your addresses" },
        { name: "Payment Methods", path: "/account/payments", description: "Manage your payment options" },
      ]
    },
    {
      id: "support",
      title: "Help & Support",
      icon: "?",
      pages: [
        { name: "Customer Support", path: "/support", description: "Get help and support" },
        { name: "FAQ", path: "/faq", description: "Frequently asked questions" },
        { name: "Privacy Policy", path: "/privacy", description: "Delivery options and times" },
        { name: "Return Policy", path: "/returns", description: "Our return and refund policy" },
        { name: "Sitemap", path: "/sitemap", description: "All site Data" },
        { name: "Track Order", path: "/track-order", description: "Track your package" },
        { name: "Terms & Condition", path: "/terms", description: "Term and Condition" },
      ]
    },
    // {
    //   id: "company",
    //   title: "Company Information",
    //   icon: "??",
    //   pages: [
    //     { name: "Our Story", path: "/our-story", description: "Company history and mission" },
    //     { name: "Meet the Team", path: "/team", description: "Our leadership and staff" },
    //     { name: "Careers", path: "/careers", description: "Job opportunities" },
    //     { name: "Press Kit", path: "/press", description: "Media resources" },
    //     { name: "Affiliate Program", path: "/affiliate", description: "Join our affiliate program" },
    //     { name: "Wholesale", path: "/wholesale", description: "Bulk purchasing options" },
    //   ]
    // },
    // {
    //   id: "legal",
    //   title: "Legal & Policies",
    //   icon: "??",
    //   pages: [
    //     { name: "Privacy Policy", path: "/privacy", description: "How we protect your data" },
    //     { name: "Terms of Service", path: "/terms", description: "Website terms and conditions" },
    //     { name: "Cookie Policy", path: "/cookies", description: "Our use of cookies" },
    //     { name: "Accessibility Statement", path: "/accessibility", description: "Our commitment to accessibility" },
    //     { name: "Legal Notice", path: "/legal", description: "Legal information and disclosures" },
    //     { name: "Code of Conduct", path: "/conduct", description: "Community guidelines" },
    //   ]
    // },
    // {
    //   id: "resources",
    //   title: "Resources & Guides",
    //   icon: "??",
    //   pages: [
    //     { name: "Blog", path: "/blog", description: "Latest articles and news" },
    //     { name: "Buying Guides", path: "/guides", description: "Helpful shopping guides" },
    //     { name: "Product Reviews", path: "/reviews", description: "Customer reviews and ratings" },
    //     { name: "Video Tutorials", path: "/tutorials", description: "How-to videos and guides" },
    //     { name: "Inspiration Gallery", path: "/gallery", description: "Creative ideas and inspiration" },
    //     { name: "Community Forum", path: "/forum", description: "Join our community discussions" },
    //   ]
    // }
  ];

  const quickLinks = [
    { name: "Shop All Products", path: "/product", category: "Shopping" },
    { name: "Contact Support", path: "/support", category: "Help" },
    { name: "Track Your Order", path: "/track-order", category: "Orders" },
    { name: "Contact Us", path: "/contact", category: "Help" },
    { name: "Latest Deals", path: "/sales", category: "Shopping" },
    { name: "Create Account", path: "/register", category: "Account" },
    { name: "FAQ", path: "/faq", category: "Help" },
    { name: "Return Policy", path: "/return", category: "Legal" },
  ];

  const popularPages = [
    { name: "New Arrivals", path: "/new-arrivals", visits: "15K" },
    { name: "Best Sellers", path: "/best-sellers", visits: "12K" },
    { name: "Customer Reviews", path: "/reviews", visits: "10K" },
    { name: "Privacy Policy", path: "/privacy", visits: "8K" },
    { name: "FAQ", path: "/faq", visits: "7K" },
  ];

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      <div className="pt-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Website Sitemap</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete overview of all pages and sections on our website. 
              Use this map to quickly find what you're looking for.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.path}
                  className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200 border border-gray-200"
                >
                  <div className="text-sm text-primary font-medium mb-1">{link.category}</div>
                  <div className="font-medium text-gray-900">{link.name}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Popular Pages */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Popular Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularPages.map((page, index) => (
                <a
                  key={index}
                  href={page.path}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-gray-900">{page.name}</div>
                    <div className="text-sm text-gray-500">{page.visits} monthly visits</div>
                  </div>
                  <div className="text-primary">
                    <ArrowIcon />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Full Sitemap */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Sitemap</h2>
            <div className="space-y-4">
              {sitemapData.map((section) => (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-500">
                          {section.pages.length} pages
                        </p>
                      </div>
                    </div>
                    <span className={`transform transition-transform ${
                      expandedSections.has(section.id) ? 'rotate-180' : ''
                    }`}>
                      <ChevronDownIcon />
                    </span>
                  </button>

                  {/* Section Content */}
                  {expandedSections.has(section.id) && (
                    <div className="border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        {section.pages.map((page, pageIndex) => (
                          <a
                            key={pageIndex}
                            href={page.path}
                            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                {page.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {page.description}
                              </div>
                              <div className="text-xs text-primary font-mono mt-1">
                                {page.path}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Help */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
              <p className="text-gray-600 mb-6">
                Use our search feature or contact our support team for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary text-white hover:bg-primary-dark">
                  Use Website Search
                </Button>
                <Button variant="outline">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>

          {/* Site Statistics */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Website Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-2">
                  {sitemapData.reduce((total, section) => total + section.pages.length, 0)}
                </div>
                <div className="text-gray-600">Total Pages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">{sitemapData.length}</div>
                <div className="text-gray-600">Main Sections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">100%</div>
                <div className="text-gray-600">Mobile Friendly</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </Screen>
  );
};

// Icons
const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default SitemapPage;