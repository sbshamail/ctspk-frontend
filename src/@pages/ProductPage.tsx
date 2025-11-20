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
  const searchTermQuery = searchParams!.get("searchTerm") ?? "";
  const sortQuery = searchParams!.get("sort") ?? "";
  const numberRangeQuery = searchParams!.get("numberRange") ?? "";
  const columnFiltersQuery = searchParams!.get("columnFilters") ?? "";
  const levelQuery = searchParams!.get("level") ?? ""; // ✅ Get level parameter

  useEffect(() => {
    const searchTermChanged = filters.searchTerm !== searchTermQuery;
    const sortChanged = filters.sort?.toString() !== sortQuery;
    const numberRangeChanged =
      JSON.stringify(filters.numberRange) !== numberRangeQuery;
    const columnFiltersChanged =
      JSON.stringify(filters.columnFilters) !== columnFiltersQuery;
    const levelChanged = filters.level !== levelQuery; // ✅ Check level change

    if (
      searchTermChanged ||
      sortChanged ||
      numberRangeChanged ||
      columnFiltersChanged ||
      levelChanged // ✅ Include level in change detection
    ) {
      setFilters((prev) => ({
        ...prev,
        limit: defaultLimit,
        page: 1,
        searchTerm: searchTermQuery || undefined,
        sort: sortQuery ? JSON.parse(sortQuery) : undefined,
        numberRange: numberRangeQuery
          ? JSON.parse(numberRangeQuery)
          : undefined,
        columnFilters: columnFiltersQuery
          ? JSON.parse(columnFiltersQuery)
          : undefined,
        level: levelQuery || undefined, // ✅ Pass level to filters
      }));
    }
  }, [searchTermQuery, sortQuery, numberRangeQuery, columnFiltersQuery, levelQuery]);

  let categoriesList: string[] = [];
  try {
    const parsed = columnFiltersQuery ? JSON.parse(columnFiltersQuery) : [];
    categoriesList = parsed
      .filter((f: any) => f[0] === "category.root_id")
      .map((f: any) => String(f[1]));
  } catch {
    categoriesList = [];
  }

  const breadcrumbData = [
    { link: "/", name: "Home" },
    { link: "/product", name: "Product" },
  ];
  return (
    <>
      <div className="w-full flex flex-1 gap-4 pt-10">
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
        <div className="w-full">
          <div className="w-full flex justify-between items-center pb-4">
            <BreadcrumbSimple data={breadcrumbData} />
            <div>
              <SortDropdown addQuery={addQuery} />
            </div>
          </div>

          <div className="w-full grid  grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
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
