"use client";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import ProductFilterSidebar from "@/components/product/ProductFilterSidebar";
import ProductInfiniteScroll from "@/components/product/ProductInfiniteScroll";
import { SortDropdown } from "@/components/product/sortDropdown";
import {
  ProductQueryParams,
  useGetProductsQuery,
} from "@/store/services/productApi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const defaultLimit = 5;
const ProductPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ProductQueryParams>({
    limit: defaultLimit,
    page: 1,
    searchTerm: undefined,
    columnFilters: undefined,
    dateRange: undefined,
    numberRange: undefined,
  });

  const { page, limit } = filters;
  const { data, error, isLoading, isFetching } = useGetProductsQuery(filters, {
    refetchOnMountOrArgChange: true,
  });

  // ---------------------------
  // Helpers to manage query params
  // ---------------------------
  const addQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams!.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
    ``;
  };

  const deleteQueryAll = () => {
    router.push(pathname!); // clears all search params
  };

  // infinite scroll
  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // ---------------------------
  // Data fallbacks
  // ---------------------------
  // @ts-ignore
  const result = data?.data ?? [];
  // @ts-ignore
  const total = data?.total ?? 0;

  // ---------------------------
  // Sync filters with URL params
  // ---------------------------
  const categoriesList = searchParams!.get("categories")?.split(",") ?? [];
  const searchTermQuery = searchParams!.get("searchTerm") ?? "";
  const sortQuery = searchParams!.get("sort") ?? "";

  useEffect(() => {
    const searchTermChanged = filters.searchTerm !== searchTermQuery;
    const sortChanged = filters.sort?.toString() !== sortQuery; // handle array/JSON string
    if (searchTermChanged || sortChanged) {
      setFilters((prev) => ({
        ...prev,
        limit: defaultLimit,
        page: 1, // 👈 start from 1 not 0
        searchTerm: searchTermQuery || undefined,
        sort: sortQuery ? JSON.parse(sortQuery) : undefined, // parse back to array
      }));
    }
  }, [searchTermQuery, sortQuery]);

  const breadcrumbData = [
    { link: "/", name: "Home" },
    { link: "/product", name: "Product" },
  ];
  console.log(data);
  return (
    <>
      <div className="flex flex-1 gap-4 pt-10">
        <div className=" hidden lg:flex relative ">
          <div className=" lg:w-80 h-full overflow-y-auto px-4 py-4">
            <ProductFilterSidebar
              categoriesList={categoriesList}
              addQuery={addQuery}
              deleteQueryAll={deleteQueryAll}
            />
          </div>
          <div className="absolute right-0 h-full border border-border"></div>
        </div>
        <div>
          <div className="flex justify-between items-center pb-4">
            <BreadcrumbSimple data={breadcrumbData} />
            <div>
              <SortDropdown addQuery={addQuery} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <ProductInfiniteScroll
              defaultLimit={defaultLimit}
              data={result}
              isFetching={isFetching}
              error={error}
              isLoading={isLoading}
              setPage={setPage}
              count={total}
              page={page}
              limit={limit}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
