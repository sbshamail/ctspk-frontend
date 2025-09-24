"use client";
import { useCallback, useEffect, useState } from "react";
import { InView } from "react-intersection-observer";

// import { ProductDataType } from '@/utils/interfaces/responseTypes/responseTypes';
import ProductCardSkeleton from "../loaders/ProductCardSkeleton";
import ProductCard from "./ProductCard";

interface Props {
  data: any;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  limit: number;
  page: number;
  count: number;
  setPage: (p: number) => void;
}
const ProductInfiniteScroll = ({
  data,
  isLoading,
  isFetching,
  error,
  count,
  page,
  setPage,
}: Props) => {
  const [hasMore, setHasMore] = useState(true);

  // Handle data merge and pagination
  useEffect(() => {
    if (data.length < count && !isFetching) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  }, [data, count, isFetching]);

  const handleViewChange = useCallback(
    (inView: boolean) => {
      if (inView && hasMore && !isFetching) {
        setTimeout(() => {
          setPage(page + 1);
        }, 3000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasMore, isFetching]
  );
  const productSkeleton = () =>
    Array(4)
      .fill(null)
      .map((_, index) => <ProductCardSkeleton key={index} />);

  if (isLoading) return productSkeleton();

  if (error) return <p>Error occurred</p>;
  return (
    <>
      {data?.map((item: any, index: number) => (
        // @ts-ignore
        <ProductCard key={index} {...item} />
      ))}
      {isFetching ? productSkeleton() : null}
      <InView as="div" onChange={handleViewChange}>
        <div></div>
      </InView>
    </>
  );
};

export default ProductInfiniteScroll;
