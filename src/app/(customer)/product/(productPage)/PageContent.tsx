"use client";
import { Screen } from "@/@core/layout";
import ProductFilterSidebar from "@/components/product/ProductFilterSidebar";
import ProductInfiniteScroll from "@/components/product/ProductInfiniteScroll";
import { Separator } from "@/components/ui/separator";
import { useGetProductsQuery } from "@/store/services/product";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const defaultLimit = 10;
const ProductPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    limit: defaultLimit,
    page: 0,
    searchTerm: "",
    categories: [] as string[],
  });

  const { page, limit, categories, searchTerm } = filters;
  const { data, error, isLoading, isFetching } = useGetProductsQuery(
    {
      page,
      limit,
    },
    { refetchOnMountOrArgChange: true }
  );

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

  useEffect(() => {
    const categoriesChanged =
      JSON.stringify(filters.categories) !== JSON.stringify(categoriesList);
    const searchTermChanged = filters.searchTerm !== searchTermQuery;

    if (categoriesChanged || searchTermChanged) {
      setFilters((prev) => ({
        ...prev,
        limit: defaultLimit,
        page: 0,
        categories: categoriesList,
        searchTerm: searchTermQuery,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesList, searchTermQuery]);

  return (
    <>
      <Separator />
      <Screen>
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
              <ProductInfiniteScroll
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
      </Screen>
    </>
  );
};

export default ProductPageContent;
