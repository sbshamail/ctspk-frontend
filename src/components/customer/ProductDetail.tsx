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
import SingleProductAddToCart from "./SingleProductAddtoCart";
import { ImageType } from "@/utils/modelTypes";

interface Product {
  id: number;
  name: string;
  image: ImageType;
  price: number;
  salePrice?: number;
  max_price?: number;
  min_price?: number;
  category: { id: number; name: string };
  slug: string;
  gallery?: ImageType[];

  rating: number;
  quantity: number;
  description: string;
  // salePrice: number;
  // reviews: number;
  // sku: string;
  // weight: string;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const {
    id,
    category,
    name,
    price,
    slug,
    image,
    gallery,
    min_price,
    max_price,
    rating = 0,
    quantity: quota = 0,
    description,
  } = product || {};
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage = Math.round(
    ((price - (min_price ?? 0)) / price) * 100
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
                src={
                  image?.original ? image?.original : "/defaultProductImage.png"
                }
                alt={slug}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {gallery &&
              gallery?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-muted"
                  }`}
                >
                  <Image
                    src={
                      image?.original
                        ? image?.original
                        : "/defaultProductImage.png"
                    }
                    alt={slug}
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
            {min_price && (
              <span className="text-3xl font-bold text-foreground">
                Rs {min_price}.00
              </span>
            )}
            <span className="text-xl text-muted-foreground line-through">
              Rs {price}.00
            </span>
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="text-sm">
                {discountPercentage}% off
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {/* <span className="text-muted-foreground">({reviews})</span> */}
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
            <SingleProductAddToCart product={product} />
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
              <span className="font-medium">{category?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Stock:</span>
              <span className="font-medium text-green-600">In Stock</span>
            </div>
            {/* <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{product.weight}</span>
            </div> */}
            {/* <div className="flex items-center gap-4">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-medium">{sku}</span>
            </div> */}
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
                {description}
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
