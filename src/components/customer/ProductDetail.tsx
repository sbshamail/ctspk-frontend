"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCartService } from "@/lib/cartService";

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
    shop: { id: number };
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState(product.image.original);
  const [quantity, setQuantity] = useState(1);
  
  const { add } = useCartService();

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

    return product.variation_options.find(variation => {
      return Object.entries(selectedAttributes).every(([attribute, value]) => {
        return variation.options[attribute] === value;
      });
    });
  }, [selectedAttributes, product.variation_options, product.product_type]);

  // Get current display price and quantity
  const displayPrice = useMemo(() => {
    if (product.product_type === "variable" && selectedVariation) {
      return parseFloat(selectedVariation.price);
    }
    return product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
  }, [product, selectedVariation]);

  const displayQuantity = useMemo(() => {
    if (product.product_type === "variable" && selectedVariation) {
      return selectedVariation.quantity;
    }
    return product.quantity;
  }, [product, selectedVariation]);

  // Handle attribute selection
  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  // Check if an attribute combination is available
  const isAttributeAvailable = (attributeName: string, value: string) => {
    const testAttributes = { ...selectedAttributes, [attributeName]: value };
    
    return product.variation_options.some(variation => {
      return Object.entries(testAttributes).every(([attr, val]) => {
        return variation.options[attr] === val;
      });
    });
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product.product_type === "variable" && !selectedVariation) {
      alert("Please select all options");
      return;
    }

    // Create a cart-compatible product object
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      sale_price: product.sale_price,
      image: {
        original: product.image.original,
        thumbnail: product.image.thumbnail
      },
      variation_options: product.variation_options.map(vo => ({
        id: vo.id,
        title: vo.title,
        price: vo.price,
        sale_price: vo.sale_price,
        purchase_price: undefined,
        quantity: vo.quantity,
        options: vo.options,
        image: {
          original: vo.image.original,
          thumbnail: vo.image.thumbnail
        },
        sku: vo.sku,
        bar_code: undefined,
        is_active: vo.is_active
      }))
    };

    const productToAdd = {
      product: cartProduct,
      shop_id: product.shop.id,
      quantity: quantity,
      variation_option_id: selectedVariation?.id || null
    };

    console.log("Adding to cart:", productToAdd);
    add(productToAdd);
  };

  // Update image when variation changes
  useEffect(() => {
    if (selectedVariation?.image) {
      setSelectedImage(selectedVariation.image.original);
    }
  }, [selectedVariation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="border rounded-lg overflow-hidden">
            <Image
              src={selectedImage}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image.original)}
                  className={`flex-shrink-0 border-2 rounded-lg overflow-hidden ${
                    selectedImage === image.original 
                      ? "border-primary" 
                      : "border-transparent"
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
            <p className="text-gray-600 mt-2">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              Rs {displayPrice.toLocaleString()}
            </span>
            {product.sale_price && product.sale_price > 0 && (
              <span className="text-lg text-gray-500 line-through">
                Rs {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Variable Product Attributes */}
          {product.product_type === "variable" && product.attributes.map(attribute => (
            <div key={attribute.id} className="space-y-3">
              <h3 className="font-semibold text-gray-900">{attribute.name}</h3>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map(value => {
                  const isSelected = selectedAttributes[attribute.name] === value.value;
                  const isAvailable = isAttributeAvailable(attribute.name, value.value);
                  
                  return (
                    <button
                      key={value.id}
                      onClick={() => handleAttributeSelect(attribute.name, value.value)}
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

          {/* Quantity Selector */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 border rounded-lg flex items-center justify-center disabled:opacity-50"
              >
                -
              </button>
              <span className="w-16 text-center border rounded-lg py-2">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(prev => prev + 1)}
                disabled={quantity >= displayQuantity}
                className="w-10 h-10 border rounded-lg flex items-center justify-center disabled:opacity-50"
              >
                +
              </button>
              <span className="text-sm text-gray-500">
                {displayQuantity} available
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className={`text-sm font-medium ${
            displayQuantity > 0 ? "text-green-600" : "text-red-600"
          }`}>
            {displayQuantity > 0 ? "In Stock" : "Out of Stock"}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={
              displayQuantity === 0 || 
              (product.product_type === "variable" && !selectedVariation)
            }
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {product.product_type === "variable" && !selectedVariation
              ? "Select Options"
              : displayQuantity === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>

          {/* Selected Variation Info */}
          {selectedVariation && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">Selected Variation</h4>
              <p className="text-sm text-gray-600">{selectedVariation.title}</p>
              <p className="text-sm text-gray-600">SKU: {selectedVariation.sku}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}