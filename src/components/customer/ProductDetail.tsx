"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ZoomIn, ZoomOut, ShoppingCart, Store, Star, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { currencyFormatter } from "@/utils/helper";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import StarRating from "@/components/starRating";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { isRatingEnabled, isReviewEnabled } from "@/lib/useSettings";

// Review interface
interface ReviewUser {
  id: number;
  name: string;
  avatar?: {
    id: number;
    original: string;
    thumbnail: string | null;
  };
}

interface ProductReview {
  id: number;
  order_id: number;
  user_id: number;
  shop_id: number;
  product_id: number;
  variation_option_id: number | null;
  comment: string;
  rating: number;
  photos: Array<{ original: string; thumbnail?: string }> | null;
  created_at: string;
  updated_at: string | null;
  user: ReviewUser;
}

interface ProductDetailProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    sale_price: number | null;
    max_price: number;
    min_price: number;
    quantity: number;
    rating?: number;
    review_count?: number;
    product_type: "simple" | "variable";
    image: {
      original: string;
      thumbnail: string;
    };
    gallery: Array<{
      original: string;
      thumbnail: string;
    }> | null;
    attributes: Array<{
      id: number;
      name: string;
      values: Array<{
        id: number;
        value: string;
        meta: string;
      }>;
      selected_values: number[];
      is_visible: boolean;
      is_variation: boolean;
    }>;
    variation_options: Array<{
      id: number;
      title: string;
      price: string;
      sale_price: string | null;
      quantity: number;
      options: Record<string, string>;
      image: {
        original: string;
        thumbnail: string;
      };
      sku: string;
      is_active: boolean;
    }>;
    shop: { id: number; name?: string };
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedImage, setSelectedImage] = useState(product.image.original);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const REVIEWS_LIMIT = 10;

  // Settings state for ratings and reviews visibility
  const [showRatings, setShowRatings] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Check settings on mount
  useEffect(() => {
    setShowRatings(isRatingEnabled());
    setShowReviews(isReviewEnabled());
  }, []);

  const { add, cart, update } = useCart();

  // Get all gallery images including main image
  const allImages = useMemo(() => {
    const images = [product.image];
    if (product.gallery) {
      images.push(...product.gallery);
    }
    return images;
  }, [product.image, product.gallery]);

  // Find the selected variation based on chosen attributes
  const selectedVariation = useMemo(() => {
    if (product.product_type !== "variable") return null;

    return product.variation_options.find((variation) => {
      return Object.entries(selectedAttributes).every(([attribute, value]) => {
        return variation.options[attribute] === value;
      });
    });
  }, [selectedAttributes, product.variation_options, product.product_type]);

  // Check if product is already in cart
  const cartItem = useMemo(() => {
    return cart.find((item) => {
      const productMatch = item.product.id === product.id;
      if (product.product_type === "variable") {
        // For variable products, only match if we have a selected variation
        // and it matches the cart item's variation
        if (!selectedVariation) {
          return false; // No variation selected, so can't match
        }
        return productMatch && item.variation_option_id === selectedVariation.id;
      }
      // For simple products, just match by product ID
      return productMatch;
    });
  }, [cart, product.id, product.product_type, selectedVariation]);

  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // Get current display price and quantity
  const displayPrice = useMemo(() => {
    if (product.product_type === "variable" && selectedVariation) {
      return parseFloat(selectedVariation.price);
    }
    return product.sale_price && product.sale_price > 0
      ? product.sale_price
      : product.price;
  }, [product, selectedVariation]);

  const displayQuantity = useMemo(() => {
    if (product.product_type === "variable") {
      if (selectedVariation) {
        return selectedVariation.quantity;
      }
      // When no variation selected, use max quantity from all variations
      const maxVariationQty = Math.max(
        ...product.variation_options.map((v) => v.quantity),
        1
      );
      return maxVariationQty;
    }
    return product.quantity;
  }, [product, selectedVariation]);

  // Handle attribute selection
  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  // Check if an attribute combination is available
  const isAttributeAvailable = (attributeName: string, value: string) => {
    const testAttributes = { ...selectedAttributes, [attributeName]: value };

    return product.variation_options.some((variation) => {
      return Object.entries(testAttributes).every(([attr, val]) => {
        return variation.options[attr] === val;
      });
    });
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (product.product_type === "variable" && !selectedVariation) {
      toast.error("Please select all options");
      return;
    }

    // Get the correct image - use variation image if available
    const variationImage = selectedVariation?.image;
    const cartImage = {
      original: variationImage?.original || product.image?.original || "",
      thumbnail: variationImage?.thumbnail || product.image?.thumbnail || "",
    };

    // Get correct price from variation
    const variationPrice = selectedVariation ? parseFloat(selectedVariation.price) : displayPrice;
    const variationSalePrice = selectedVariation?.sale_price ? parseFloat(selectedVariation.sale_price) : null;

    // Create a cart-compatible product object
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: variationPrice,
      sale_price: variationSalePrice,
      image: cartImage,
      variation_options: product.variation_options?.map((vo) => ({
        id: vo.id,
        title: vo.title,
        price: vo.price,
        sale_price: vo.sale_price,
        purchase_price: undefined,
        quantity: vo.quantity,
        options: vo.options,
        image: {
          original: vo.image?.original || product.image?.original || "",
          thumbnail: vo.image?.thumbnail || product.image?.thumbnail || "",
        },
        sku: vo.sku,
        bar_code: undefined,
        is_active: vo.is_active,
      })) || [],
    };

    const productToAdd = {
      product: cartProduct,
      shop_id: product.shop?.id,
      quantity: 1, // Always add 1 initially
      variation_option_id: selectedVariation?.id || null,
    };

    console.log("Adding to cart:", productToAdd);

    try {
      await add(productToAdd);
      // Toast is already shown by cart service
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  // Update image when variation changes
  useEffect(() => {
    if (selectedVariation?.image) {
      setSelectedImage(selectedVariation.image.original);
    }
  }, [selectedVariation]);

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const skip = (reviewsPage - 1) * REVIEWS_LIMIT;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(
          `${apiUrl}/review/product/${product.id}?page=${reviewsPage}&skip=${skip}&limit=${REVIEWS_LIMIT}`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setReviews(result.data);
            setHasMoreReviews(result.data.length === REVIEWS_LIMIT);
          } else {
            setReviews([]);
          }
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [product.id, reviewsPage]);

  // Handle mouse move for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] aspect-square mx-auto border rounded-lg overflow-hidden bg-white">
            <div
              className="relative w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                width={600}
                height={600}
                className={`w-full h-full object-contain transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
              />
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                title={isZoomed ? "Zoom Out" : "Zoom In"}
              >
                {isZoomed ? (
                  <ZoomOut className="w-5 h-5 text-gray-700" />
                ) : (
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image.original)}
                  className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImage === image.original
                      ? "border-primary scale-105"
                      : "border-gray-300 hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={image.thumbnail}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating and Review Count - Only show if ratings are enabled */}
            {showRatings && (
              <div className="mt-2">
                <StarRating
                  averageRating={product.rating || 0}
                  disabled
                  reviewCount={product.review_count}
                  showReviewCount={true}
                  size="md"
                />
              </div>
            )}

            {/* Shop Name */}
            {product.shop?.name && (
              <div className="flex items-center gap-2 mt-3">
                <Store className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Sold by: <span className="font-semibold text-gray-900">{product.shop.name}</span>
                </span>
              </div>
            )}

            <p className="text-gray-600 mt-3">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {currencyFormatter(displayPrice)}
            </span>
            {product.sale_price && product.sale_price > 0 && (
              <span className="text-lg text-gray-500 line-through">
                {currencyFormatter(product.price)}
              </span>
            )}
            {product.sale_price && product.sale_price > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
              </span>
            )}
          </div>

          {/* Variable Product Attributes */}
          {product.product_type === "variable" &&
            product.attributes.map((attribute) => (
              <div key={attribute.id} className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  {attribute.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attribute.values.map((value) => {
                    const isSelected =
                      selectedAttributes[attribute.name] === value.value;
                    const isAvailable = isAttributeAvailable(
                      attribute.name,
                      value.value
                    );

                    return (
                      <button
                        key={value.id}
                        onClick={() =>
                          handleAttributeSelect(attribute.name, value.value)
                        }
                        disabled={!isAvailable}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : isAvailable
                            ? "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {value.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Stock Status */}
          <div
            className={`text-sm font-medium ${
              displayQuantity > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {displayQuantity > 0 ? `In Stock (${displayQuantity} available)` : "Out of Stock"}
          </div>

          {/* Show +/- Quantity Selector only when item is in cart */}
          {isInCart ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-3">
                  ✓ In your cart
                </p>
                <div className="flex items-center gap-4">
                  <QuantitySelector
                    quantity={cartQuantity}
                    onIncrease={() => {
                      const newQty = Math.min(displayQuantity, cartQuantity + 1);
                      update(product.id, newQty, cartItem?.variation_option_id);
                    }}
                    onDecrease={() => {
                      const newQty = Math.max(1, cartQuantity - 1);
                      update(product.id, newQty, cartItem?.variation_option_id);
                    }}
                    maxQuantity={displayQuantity}
                    minQuantity={1}
                    size="lg"
                  />
                  <span className="text-sm text-gray-500">
                    in cart
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Add to Cart Button - only show when not in cart */
            <Button
              onClick={handleAddToCart}
              disabled={
                displayQuantity === 0 ||
                (product.product_type === "variable" && !selectedVariation)
              }
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 px-6 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.product_type === "variable" && !selectedVariation
                ? "Select Options First"
                : displayQuantity === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          )}

          {/* Selected Variation Info */}
          {selectedVariation && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">
                Selected Variation
              </h4>
              <p className="text-sm text-gray-600">{selectedVariation.title}</p>
              <p className="text-sm text-gray-600 hidden">
                SKU: {selectedVariation.sku}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section - Only show if reviews are enabled */}
      {showReviews && (
      <div className="mt-16 border-t pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {reviews.length > 0 && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
            )}
          </div>

          {/* Average Rating */}
          {showRatings && reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                  return (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= avgRating
                          ? "text-yellow-400 fill-yellow-400"
                          : star - 0.5 <= avgRating
                          ? "text-yellow-400 fill-yellow-400/50"
                          : "text-gray-300"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Reviews Loading State */}
        {isLoadingReviews ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.user.avatar?.original ? (
                      <Image
                        src={review.user.avatar.original}
                        alt={review.user.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/20">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Star Rating - Only show if ratings are enabled */}
                    {showRatings && (
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {review.comment}
                      </p>
                    )}

                    {/* Review Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <Image
                              src={photo.thumbnail || photo.original}
                              alt={`Review photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {(reviewsPage > 1 || hasMoreReviews) && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewsPage(prev => Math.max(1, prev - 1))}
                  disabled={reviewsPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 font-medium">
                  Page {reviewsPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewsPage(prev => prev + 1)}
                  disabled={!hasMoreReviews}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* No Reviews State */
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Be the first to review this product! Share your experience with other customers.
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
