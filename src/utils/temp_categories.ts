const richCategories = [
  // --- Category 1: Electronics & Gadgets (High-value, high-detail) ---
  {
    name: "Electronics & Appliances",
    image: "/assets/imgs/theme/icons/category-electronics.svg",
    children: [
      {
        name: "Mobiles & Tablets", // Level 2
        image: "/assets/imgs/theme/icons/category-mobile.svg",
        children: [
          {
            name: "Smartphones",
            image: "/assets/imgs/theme/icons/category-smartphone.svg",
          }, // Level 3
          {
            name: "Feature Phones",
            image: "/assets/imgs/theme/icons/category-feature-phone.svg",
          },
          {
            name: "Tablets & E-Readers",
            image: "/assets/imgs/theme/icons/category-tablet.svg",
          },
          {
            name: "Mobile Accessories",
            image: "/assets/imgs/theme/icons/category-accessories.svg",
          },
        ],
      },
      {
        name: "Home Appliances", // Level 2
        image: "/assets/imgs/theme/icons/category-appliances.svg",
        children: [
          {
            name: "Washing Machines & Dryers",
            image: "/assets/imgs/theme/icons/category-washer.svg",
          }, // Level 3
          {
            name: "Refrigerators & Freezers",
            image: "/assets/imgs/theme/icons/category-fridge.svg",
          },
          {
            name: "Air Conditioners",
            image: "/assets/imgs/theme/icons/category-ac.svg",
          },
          {
            name: "Small Kitchen Appliances",
            image: "/assets/imgs/theme/icons/category-blender.svg",
          },
        ],
      },
      {
        name: "TV & Home Entertainment", // Level 2 (No L3 for brevity)
        image: "/assets/imgs/theme/icons/category-tv.svg",
      },
    ],
  },

  // --- Category 2: Fashion & Clothing (Gender-specific L2, Product-specific L3) ---
  {
    name: "Fashion & Apparel",
    image: "/assets/imgs/theme/icons/category-fashion.svg",
    children: [
      {
        name: "Men's Fashion", // Level 2
        image: "/assets/imgs/theme/icons/category-men.svg",
        children: [
          {
            name: "Casual Shirts & T-Shirts",
            image: "/assets/imgs/theme/icons/category-shirt.svg",
          }, // Level 3
          {
            name: "Formal Wear & Suits",
            image: "/assets/imgs/theme/icons/category-suit.svg",
          },
          {
            name: "Footwear & Sneakers",
            image: "/assets/imgs/theme/icons/category-shoes.svg",
          },
          {
            name: "Watches & Jewelry",
            image: "/assets/imgs/theme/icons/category-watch.svg",
          },
        ],
      },
      {
        name: "Women's Fashion", // Level 2
        image: "/assets/imgs/theme/icons/category-women.svg",
        children: [
          {
            name: "Dresses & Skirts",
            image: "/assets/imgs/theme/icons/category-dress.svg",
          }, // Level 3
          {
            name: "Kurtas & Shalwar Kameez",
            image: "/assets/imgs/theme/icons/category-ethnic.svg",
          },
          {
            name: "Handbags & Wallets",
            image: "/assets/imgs/theme/icons/category-bag.svg",
          },
          {
            name: "Intimates & Sleepwear",
            image: "/assets/imgs/theme/icons/category-bra.svg",
          },
        ],
      },
      {
        name: "Kids & Baby Clothing", // Level 2 (No L3 for brevity)
        image: "/assets/imgs/theme/icons/category-kids.svg",
      },
    ],
  },

  // --- Category 3: Home & Lifestyle (General merchandise) ---
  {
    name: "Home, Furniture & Decor",
    image: "/assets/imgs/theme/icons/category-home.svg",
    children: [
      {
        name: "Bedding & Bath", // Level 2
        image: "/assets/imgs/theme/icons/category-bed.svg",
        children: [
          {
            name: "Bedsheets & Covers",
            image: "/assets/imgs/theme/icons/category-sheet.svg",
          }, // Level 3
          {
            name: "Towels & Bath Linens",
            image: "/assets/imgs/theme/icons/category-towel.svg",
          },
          {
            name: "Pillows & Comforters",
            image: "/assets/imgs/theme/icons/category-pillow.svg",
          },
        ],
      },
      {
        name: "Furniture", // Level 2
        image: "/assets/imgs/theme/icons/category-sofa.svg",
        children: [
          {
            name: "Living Room Furniture",
            image: "/assets/imgs/theme/icons/category-living.svg",
          }, // Level 3
          {
            name: "Bedroom Furniture",
            image: "/assets/imgs/theme/icons/category-bedroom.svg",
          },
          {
            name: "Office & Study Furniture",
            image: "/assets/imgs/theme/icons/category-desk.svg",
          },
        ],
      },
      {
        name: "Kitchen & Dining", // Level 2 (No L3 for brevity)
        image: "/assets/imgs/theme/icons/category-kitchen.svg",
      },
    ],
  },

  // --- Category 4: Health & Beauty (Specific products) ---
  {
    name: "Health, Beauty & Groceries",
    image: "/assets/imgs/theme/icons/category-beauty.svg",
    children: [
      {
        name: "Make-up & Cosmetics", // Level 2
        image: "/assets/imgs/theme/icons/category-makeup.svg",
        children: [
          {
            name: "Face & Foundation",
            image: "/assets/imgs/theme/icons/category-face.svg",
          }, // Level 3
          {
            name: "Lipsticks & Glosses",
            image: "/assets/imgs/theme/icons/category-lipstick.svg",
          },
          {
            name: "Eye Make-up & Liners",
            image: "/assets/imgs/theme/icons/category-eye.svg",
          },
        ],
      },
      {
        name: "Skin & Hair Care", // Level 2
        image: "/assets/imgs/theme/icons/category-hair.svg",
        children: [
          {
            name: "Shampoos & Conditioners",
            image: "/assets/imgs/theme/icons/category-shampoo.svg",
          }, // Level 3
          {
            name: "Moisturizers & Serums",
            image: "/assets/imgs/theme/icons/category-serum.svg",
          },
          {
            name: "Sunscreen & Tanning",
            image: "/assets/imgs/theme/icons/category-sun.svg",
          },
        ],
      },
      {
        name: "Food & Groceries", // Level 2
        image: "/assets/imgs/theme/icons/category-grocery.svg",
        children: [
          {
            name: "Fresh Produce",
            image: "/assets/imgs/theme/icons/category-fruit.svg",
          },
          {
            name: "Milks & Dairies",
            image: "/assets/imgs/theme/icons/category-milk.svg",
          },
          {
            name: "Beverages & Juices",
            image: "/assets/imgs/theme/icons/category-juice.svg",
          },
        ],
      },
    ],
  },

  // --- Other High-Level Categories (L1) ---
  {
    name: "Automotive & Motorbike",
    image: "/assets/imgs/theme/icons/category-auto.svg",
  },
  {
    name: "Sports & Outdoors",
    image: "/assets/imgs/theme/icons/category-sports.svg",
  },
  {
    name: "Books, Media & Music",
    image: "/assets/imgs/theme/icons/category-book.svg",
  },
  {
    name: "Stationery & Office Supplies",
    image: "/assets/imgs/theme/icons/category-office.svg",
  },
];

export { richCategories };
