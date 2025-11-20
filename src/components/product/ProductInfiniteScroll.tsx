"use client";

import { useCallback, useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import ProductCardSkeleton from "../loaders/ProductCardSkeleton";
import ProductCard from "./ProductCard";

interface Props {
  defaultLimit: number;
  data: any[]; // Array of products passed from parent
  isLoading: boolean; // True only on the first API call
  isFetching: boolean; // True when fetching new pages
  error: any; // API error (if any)
  limit?: number; // Items per page
  page?: number; // Current page number
  count?: number; // Total number of products from backend
  setPage: (p: number) => void; // Setter function to update page (from parent)
}

const ProductInfiniteScroll = ({
  defaultLimit,
  data,
  isLoading,
  isFetching,
  error,
  count = 0,
  page = 1,
  setPage,
}: Props) => {
  // Store all loaded products
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Update local state whenever new data arrives from parent
  useEffect(() => {
    // Ensure data is always an array
    const validData = Array.isArray(data) ? data : [];

    if (page === 1) {
      setAllProducts(validData);
    } else if (validData.length > 0) {
      setAllProducts((prev) => [...prev, ...validData]);
    }
  }, [data, page]);

  // Check if there are more products left to fetch
  const hasMore = allProducts.length < count;

  // Trigger when "InView" hits bottom of the page
  const handleViewChange = useCallback(
    (inView: boolean) => {
      if (inView && hasMore && !isFetching) {
        // Load next page
        setPage(page + 1);
      }
    },
    [hasMore, isFetching, page, setPage]
  );

  // Skeleton generator (placeholder while loading/fetching)
  const productSkeleton = () =>
    Array(defaultLimit)
      .fill(null)
      .map((_, index) => <ProductCardSkeleton key={index} />);

  // Show skeletons while first page is loading
  if (isLoading) return <>{productSkeleton()}</>;

  // Show error if API fails
  if (error) return <h1>No Product Found</h1>;

  return (
    <>
      {/* Render all loaded products */}
      {allProducts.map((item, index) => (
        // @ts-ignore because product shape may vary
        <ProductCard key={index} {...item} />
      ))}

      {/* Show skeletons while fetching more pages */}
      {isFetching && productSkeleton()}

      {/* Load more when reaching bottom */}
      {hasMore && <InView as="div" onChange={handleViewChange} />}
    </>
  );
};

export default ProductInfiniteScroll;
