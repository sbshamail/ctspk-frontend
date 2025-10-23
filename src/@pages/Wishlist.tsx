"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/wishlist", name: "Wishlist" },
];

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    image: {
      original: string;
      thumbnail: string;
    };
    in_stock: boolean;
    slug: string;
  };
  added_date: string;
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    {
      id: "1",
      product: {
        id: "101",
        name: "Wireless Bluetooth Headphones",
        price: 129.99,
        sale_price: 99.99,
        image: {
          original: "/products/headphones.jpg",
          thumbnail: "/products/headphones-thumb.jpg"
        },
        in_stock: true,
        slug: "wireless-bluetooth-headphones"
      },
      added_date: "2024-01-15"
    },
    {
      id: "2",
      product: {
        id: "102",
        name: "Smart Fitness Watch",
        price: 199.99,
        image: {
          original: "/products/smartwatch.jpg",
          thumbnail: "/products/smartwatch-thumb.jpg"
        },
        in_stock: true,
        slug: "smart-fitness-watch"
      },
      added_date: "2024-01-10"
    },
    {
      id: "3",
      product: {
        id: "103",
        name: "Organic Cotton T-Shirt",
        price: 29.99,
        sale_price: 24.99,
        image: {
          original: "/products/tshirt.jpg",
          thumbnail: "/products/tshirt-thumb.jpg"
        },
        in_stock: false,
        slug: "organic-cotton-tshirt"
      },
      added_date: "2024-01-08"
    },
    {
      id: "4",
      product: {
        id: "104",
        name: "Stainless Steel Water Bottle",
        price: 34.99,
        image: {
          original: "/products/water-bottle.jpg",
          thumbnail: "/products/water-bottle-thumb.jpg"
        },
        in_stock: true,
        slug: "stainless-steel-water-bottle"
      },
      added_date: "2024-01-05"
    }
  ]);

  const [loading, setLoading] = useState(false);

  const removeFromWishlist = (itemId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== itemId));
  };

  const moveAllToCart = () => {
    // Implementation for moving all items to cart
    console.log("Moving all items to cart");
  };

  const shareWishlist = () => {
    // Implementation for sharing wishlist
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Wishlist link copied to clipboard!');
    }
  };

  const clearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlist([]);
    }
  };

  const getTotalPrice = () => {
    return wishlist.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + price;
    }, 0);
  };

  const getOriginalTotal = () => {
    return wishlist.reduce((total, item) => total + item.product.price, 0);
  };

  const inStockItems = wishlist.filter(item => item.product.in_stock);
  const outOfStockItems = wishlist.filter(item => !item.product.in_stock);

  if (loading) {
    return (
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-6" />
        <LayoutSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      <div className="pt-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            
            {wishlist.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                <Button 
                  variant="outline" 
                  onClick={shareWishlist}
                  className="flex items-center gap-2"
                >
                  <ShareIcon />
                  Share Wishlist
                </Button>
                <Button 
                  variant="outline" 
                  onClick={moveAllToCart}
                  disabled={inStockItems.length === 0}
                  className="flex items-center gap-2"
                >
                  <CartIcon />
                  Add All to Cart ({inStockItems.length})
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearWishlist}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {wishlist.length === 0 ? (
            /* Empty Wishlist State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Save items you love to your wishlist. Review them anytime and easily move them to your cart.
              </p>
              <Link href="/products">
                <Button className="bg-primary text-white hover:bg-primary-dark">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Wishlist Items */}
              <div className="lg:col-span-3">
                {/* In Stock Items */}
                {inStockItems.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Available Items ({inStockItems.length})
                    </h3>
                    <div className="space-y-4">
                      {inStockItems.map((item) => (
                        <WishlistItemCard
                          key={item.id}
                          item={item}
                          onRemove={removeFromWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Out of Stock Items */}
                {outOfStockItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">
                      Out of Stock ({outOfStockItems.length})
                    </h3>
                    <div className="space-y-4">
                      {outOfStockItems.map((item) => (
                        <WishlistItemCard
                          key={item.id}
                          item={item}
                          onRemove={removeFromWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items</span>
                      <span className="text-gray-900">{wishlist.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">In Stock</span>
                      <span className="text-green-600">{inStockItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Out of Stock</span>
                      <span className="text-red-600">{outOfStockItems.length}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-900 font-semibold">Total Value</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          ${getTotalPrice().toFixed(2)}
                        </div>
                        {getTotalPrice() < getOriginalTotal() && (
                          <div className="text-sm text-gray-500 line-through">
                            ${getOriginalTotal().toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary text-white hover:bg-primary-dark mb-3"
                    disabled={inStockItems.length === 0}
                  >
                    Add All to Cart
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={shareWishlist}>
                    Share Wishlist
                  </Button>
                </div>

                {/* Recently Viewed */}
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Viewed</h3>
                  <p className="text-gray-600 text-sm">
                    Your recently viewed items will appear here as you browse our store.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
};

// Wishlist Item Card Component
const WishlistItemCard = ({ 
  item, 
  onRemove 
}: { 
  item: WishlistItem; 
  onRemove: (id: string) => void;
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAddingToCart(false);
    // Implementation for adding to cart
    console.log("Adding to cart:", item.product.id);
  };

  const price = item.product.sale_price || item.product.price;
  const hasSale = item.product.sale_price && item.product.sale_price < item.product.price;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Product</span>
            </div>
            {/* Replace with actual Image component:
            <Image
              src={item.product.image.thumbnail}
              alt={item.product.name}
              width={80}
              height={80}
              className="object-cover"
            />
            */}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-grow">
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="font-medium text-gray-900 hover:text-primary transition-colors mb-1">
              {item.product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${hasSale ? 'text-red-600' : 'text-gray-900'}`}>
                ${price.toFixed(2)}
              </span>
              {hasSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${item.product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${item.product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${item.product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
              {item.product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={addToCart}
              disabled={!item.product.in_stock || isAddingToCart}
              className="bg-primary text-white hover:bg-primary-dark text-xs"
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemove(item.id)}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons
const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const ShareIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
  </svg>
);

const CartIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

export default WishlistPage;