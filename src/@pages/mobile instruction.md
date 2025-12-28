 Done! Here's a summary of the changes:

  MobileBottomBar Updates:

  1. Badge Styling ✅

  - Badges now appear on top of icons with small red background
  - Font size: text-[8px] for compact display
  - Shows 99+ if count exceeds 99

  2. Wishlist Badge ✅

  - Added useGetWishlistQuery to get wishlist count
  - Badge shows on Heart icon when items exist

  3. Cart Badge ✅

  - Already working, improved styling

  4. Menu Button ✅

  - Added Menu icon in bottom nav
  - Opens a bottom Sheet with grouped links:
    - Account: Profile, Orders, Track Order, Wishlist
    - About Us: About, Contact, Team
    - Information: Privacy, Terms, Returns, Support
  - Shows "Sign In / Register" button if not logged in

  5. Layout ✅

  - 5 items: Home, Wishlist, Cart, Account/Sign In, Menu
  - Text labels hidden on screens < 360px (icons only)

  6. Fixed Duplicate Sign In ✅

  - Each component has its own SiginModal instance (Footer for footer links, MobileBottomBar for nav)

> tell me the how to hide dive on small screen and where to add menu in bottom menu icon click area  to show more menu

● How to Hide a Div on Small Screens (Tailwind CSS)

  // Hide on mobile, show on larger screens
  <div className="hidden sm:block">Content here</div>

  // Hide on screens smaller than 640px
  <div className="hidden sm:block">...</div>  // Shows at 640px+

  // Hide on screens smaller than 768px
  <div className="hidden md:block">...</div>  // Shows at 768px+

  // Hide on screens smaller than 1024px
  <div className="hidden lg:block">...</div>  // Shows at 1024px+

  // Show only on mobile (hide on larger)
  <div className="block sm:hidden">Mobile only</div>

  // Custom breakpoint (e.g., hide below 400px)
  <div className="hidden min-[400px]:block">...</div>

  ---
  Where to Add Menu Items in Bottom Nav

  File: src/components/customer/footer/MobileBottomBar.tsx

  Location: Lines 37-64 - the menuGroups array:

  const menuGroups = [
    {
      title: "Account",
      links: [
        { name: "My Profile", href: "/profile" },
        { name: "My Orders", href: "/orders" },
        { name: "Track Order", href: "/track-order" },
        { name: "My Wishlist", href: "/wishlist" },
        // 👈 ADD MORE ACCOUNT LINKS HERE
      ],
    },
    {
      title: "About Us",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact Us", href: "/contact" },
        { name: "Our Team", href: "/teams" },
        // 👈 ADD MORE ABOUT LINKS HERE
      ],
    },
    {
      title: "Information",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms & Conditions", href: "/terms" },
        { name: "Returns Policy", href: "/returns" },
        { name: "Customer Support", href: "/support" },
        // 👈 ADD MORE INFO LINKS HERE
      ],
    },
    // 👈 ADD NEW GROUP HERE
    // {
    //   title: "Shop",
    //   links: [
    //     { name: "New Arrivals", href: "/new-arrivals" },
    //     { name: "Sales", href: "/sales" },
    //   ],
    // },
  ];