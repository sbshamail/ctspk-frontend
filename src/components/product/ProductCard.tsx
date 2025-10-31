import { titleSubstring } from "@/utils/helper";
import Link from "next/link";
import StarRating from "../starRating";
import { ProductTag } from "../tag/ProductTag";
import { PriceAndSalePrice } from "../typography/PriceAndSalePrice";
import { Card } from "../ui/card";
import { ProductCartButton } from "./ProductCartButton";
import { ProductFavorite } from "./ProductFavorite";
import ProductImage from "./ProductImage";

interface Props {
  name: string;
  slug?: string;
  shop: { id: number; name: string };
  image: string;
  rating?: number;
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

  // ✅ For variable products, we need to handle cart addition differently
  // Show cart button only if it's a simple product OR variable product with available variations
  const shouldShowCartButton = !isVariableProduct || hasVariations;

  return (
    <div className=" ">
      <Link href={`/product/${slug}`} className="z-0">
        <Card className=" cursor-pointer p-0 ">
          <div>
            <div className="relative transition duration-300">
              <ProductImage image={image} alt={name} className="min-h-56" />
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
                  <ProductFavorite />
                </div>
              </div>
            </div>
            <div className="p-2">
              <h2 className="m-0 p-0 text-sm font-medium line-clamp-1 h-5 ">
                {titleSubstring(name)}
              </h2>
              <div className="w-full flex items-center justify-between ">
                <div className="w-full flex flex-col mt-2 space-y-2">
                  <div>
                    <StarRating averageRating={rating} disabled />
                  </div>
                  <div className="w-full flex justify-between">
                    <PriceAndSalePrice
                      price={price}
                      salePrice={hasValidSalePrice ? sale_price : undefined}
                      showPercentage={showPercentage}
                    />
                    {/* ✅ Show price range for variable products */}
                    {isVariableProduct && hasVariations && (
                      <span className="text-xs text-muted-foreground ml-2">
                        From Rs {price.toLocaleString()}
                      </span>
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
