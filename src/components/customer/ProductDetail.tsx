"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Facebook,
  Heart,
  Instagram,
  RotateCcw,
  ShoppingCart,
  Star,
  Truck,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Product {
  id: number;
  title: string;
  images: string[];
  rating: number;
  price: number;
  salePrice: number;
  reviews: number;
  sku: string;
  category: { id: number; name: string };
  weight: string;
  quota: number;
  description: string;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage = Math.round(
    ((product.price - product.salePrice) / product.price) * 100
  );

  return (
    <div className="">
      {/* Product Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2  gap-8 lg:gap-12  justify-center">
        <div className="w-full space-y-4 border rounded-lg p-2 ">
          <div className="flex justify-center ">
            {/* Main Image */}
            <div className=" aspect-square max-h-[400px] lg:max-h-[calc(100vh-50%)]  rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-muted"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.title} ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              Rs {product.salePrice}.00
            </span>
            <span className="text-xl text-muted-foreground line-through">
              Rs {product.price}.00
            </span>
            <Badge variant="destructive" className="text-sm">
              {discountPercentage}% off
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Policies */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="w-4 h-4" />
              <span>7 Days Return Policy</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span>Cash on Delivery available</span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.quota, quantity + 1))
                }
                className="px-3 py-2 hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>

            <Button className="max-w-[200px] flex-1 bg-primary hover:bg-primary/90">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={isWishlisted ? "text-red-500 border-red-500" : ""}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
              />
            </Button>
          </div>

          {/* Product Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{product.category.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Stock:</span>
              <span className="font-medium text-green-600">In Stock</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{product.weight}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
          </div>

          {/* Social Share */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Share:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
              >
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Product Description & Reviews */}
      <div className="lg:col-span-2 mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">DESCRIPTION</TabsTrigger>
            <TabsTrigger value="reviews">REVIEWS</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
