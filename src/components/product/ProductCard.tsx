import { titleSubstring, currencyFormatter } from "@/utils/helper";
import Link from "next/link";
import StarRating from "../starRating";
import { ProductTag } from "../tag/ProductTag";
import { PriceAndSalePrice } from "../typography/PriceAndSalePrice";
import { Card } from "../ui/card";
import { ProductCartButton } from "./ProductCartButton";
import { ProductFavorite } from "./ProductFavorite";
import ProductImage from "./ProductImage";
import { Store } from "lucide-react";

interface Props {
  name: string;
  slug?: string;
  shop: { id: number; name: string };
  image: string;
  rating?: number;
  review_count?: number;
  price: number;
  quantity: number;
  sale_price?: number;
  showPercentage?: boolean;
  Tags?: () => React.ReactNode;
  CartButton?: () => React.ReactNode;
  product_type?: "simple" | "variable"; // ✅ Add product_type
  variation_options?: any[]; // ✅ Add variation_options for variable products
  id: number; // ✅ Ensure product ID is available
}

const ProductCard = ({ showPercentage, Tags, CartButton, ...props }: Props) => {
  const {
    name,
    price,
    slug = "#",
    sale_price,
    quantity,
    image,
    rating,
    product_type = "simple", // ✅ Default to simple
    id,
  } = props || {};

  // FIX: Proper sale price validation
  const hasValidSalePrice = sale_price && sale_price > 0 && sale_price < price;

  // ✅ Check if product is variable and has variations
  const isVariableProduct = product_type === "variable";
  const hasVariations =
    isVariableProduct &&
    props.variation_options &&
    props.variation_options.length > 0;

  // ✅ Calculate min and max prices for variable products
  let minPrice = price;
  let maxPrice = price;

  if (isVariableProduct && hasVariations && props.variation_options) {
    const prices = props.variation_options.map((variation: any) => {
      const varPrice = parseFloat(variation.sale_price || variation.price || "0");
      return varPrice > 0 ? varPrice : parseFloat(variation.price || "0");
    }).filter((p: number) => p > 0);

    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }
  }

  // ✅ For variable products, we need to handle cart addition differently
  // Show cart button only if it's a simple product OR variable product with available variations
  const shouldShowCartButton = !isVariableProduct || hasVariations;

  return (
    <div className=" ">
      <Link href={`/product/${slug}`} className="z-0">
        <Card className=" cursor-pointer p-0 ">
          <div>
            <div className="relative transition duration-300">
              <ProductImage image={image} alt={name} className="min-h-36 sm:min-h-48 md:min-h-56" />
              {/* Tags */}

              <div className="absolute  left-0 top-0 mt-3">
                {Tags ? (
                  Tags()
                ) : hasValidSalePrice ? (
                  <ProductTag title={"Sale"} className="" />
                ) : (
                  <ProductTag title={"Sale"} className="hidden" />
                )}
                {/* ✅ Show "Variable" tag for variable products */}
                {isVariableProduct && (
                  <ProductTag title={"Variable"} className="ml-1 bg-blue-500" />
                )}
              </div>

              <div className="absolute right-0 top-0 m-2 z-10 ">
                <div className="flex space-x-1 ">
                  {/* ✅ Always show ProductFavorite - it should work for both product types */}
                  <ProductFavorite product={{
                        ...props,
                        product_type, // ✅ Pass product_type to cart button
                        id, // ✅ Ensure ID is passed
                      }}/>
                </div>
              </div>
            </div>
            <div className="p-1 min-[360px]:p-1.5 sm:p-2">
              {/* Shop Name */}
              {props.shop?.name && (
                <div className="flex items-center gap-0.5 min-[360px]:gap-1 mb-0.5 min-[360px]:mb-1 sm:mb-2">
                  <Store className="w-2 h-2 min-[360px]:w-2.5 min-[360px]:h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                  <span className="text-[8px] min-[360px]:text-[10px] sm:text-xs text-gray-500 truncate">
                    {props.shop.name}
                  </span>
                </div>
              )}

              <h2 className="m-0 p-0 text-[10px] min-[360px]:text-xs sm:text-sm font-medium line-clamp-1 h-3.5 min-[360px]:h-4 sm:h-5">
                {titleSubstring(name)}
              </h2>
              <div className="w-full flex items-center justify-between">
                <div className="w-full flex flex-col mt-0.5 min-[360px]:mt-1 sm:mt-2 space-y-0.5 min-[360px]:space-y-1 sm:space-y-2">
                  <div className="hidden sm:block">
                    <StarRating
                      averageRating={rating}
                      disabled
                      reviewCount={props.review_count}
                      showReviewCount={true}
                      size="sm"
                    />
                  </div>
                  <div className="w-full flex justify-between">
                    {isVariableProduct && hasVariations ? (
                      <div className="flex flex-col">
                        <span className="text-foreground/80 font-semibold text-[10px] min-[360px]:text-xs sm:text-sm">
                          {minPrice === maxPrice
                            ? currencyFormatter(minPrice)
                            : `${currencyFormatter(minPrice)} - ${currencyFormatter(maxPrice)}`}
                        </span>
                      </div>
                    ) : (
                      <PriceAndSalePrice
                        price={price}
                        salePrice={hasValidSalePrice ? sale_price : undefined}
                        showPercentage={showPercentage}
                        className="text-[10px] min-[360px]:text-xs sm:text-sm"
                      />
                    )}
                  </div>
                </div>
                <div className="z-10">
                  {CartButton ? (
                    CartButton()
                  ) : shouldShowCartButton ? ( // ✅ Only show cart button if allowed
                    <ProductCartButton
                      product={{
                        ...props,
                        product_type, // ✅ Pass product_type to cart button
                        id, // ✅ Ensure ID is passed
                        min_price: minPrice,
                        max_price: maxPrice,
                      }}
                    />
                  ) : (
                    // ✅ Show disabled state or alternative for variable products without variations
                    <div className="opacity-50 cursor-not-allowed">
                      <button
                        disabled
                        className="relative inline-flex items-center justify-center text-gray-400"
                        title="Select options to add to cart"
                      >
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 10H6L5 9z"
                          />
                        </svg>
                        <svg
                          className="w-3 h-3 absolute top-1 right-0 bg-white rounded-full"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Show product type indicator */}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default ProductCard;
