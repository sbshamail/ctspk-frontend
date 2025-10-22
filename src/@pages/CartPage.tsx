"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { Button } from "@/components/ui/button";
import { useCartService } from "@/lib/cartService";
import { useSelection } from "@/lib/useSelection";
import Image from "next/image";
import Link from "next/link";

import { useMountAfterEffect, useMountFirstEffect } from "@/@core/hooks";
import { setReducer } from "@/store/common/action-reducer";
import { useEffect, useMemo, useState } from "react";
// Types
import { CartItemType } from "@/utils/modelTypes";
import MainTable, { ColumnType } from "@/components/table/MainTable";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/cart", name: "Cart" },
];

const CartPage = () => {
  const { cart, update, remove, clear, loading, removeSelected, isAuth } =
    useCartService();
  const setSelectedCart = setReducer("selectedCart");
  const { data: selectedCart = [], dispatch } = useSelection(
    "selectedCart",
    true
  );
  const [selected, setSelected] = useState<CartItemType[]>([]);
  useEffect(() => {
    dispatch(setSelectedCart(selected));
  }, [selected]);
  console.log(selected);
  useMountFirstEffect(() => {
    setSelected(cart);
  }, [cart]);

  useMountAfterEffect(() => {
    setSelected(cart);
  }, [isAuth]);

  // Derived: selected items list
  const selectedProducts = useMemo(
    () =>
      cart.filter((item: CartItemType) =>
        selectedCart?.some((s) => s?.product?.id === item.product.id)
      ),
    [cart, selectedCart]
  );

  // // Derived: total only for selected
  const selectedTotal = useMemo(
    () =>
      selectedProducts.reduce(
        (acc, item) =>
          acc + (item.product.sale_price ?? item.product.price) * item.quantity,
        0
      ),
    [selectedProducts]
  );

  const columns: ColumnType<CartItemType>[] = [
    {
      title: "Product",
      accessor: "product.name",
      render: ({ row }) => {
        const { image, name } = row.product;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
              {image?.original ? (
                <Image
                  src={image.thumbnail ?? image.original}
                  alt={name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>
            <div>
              <h2 className="font-medium">{name}</h2>
            </div>
          </div>
        );
      },
      className: "col-span-2",
    },
    {
      title: "Unit Price",
      type: "currency",
      render: ({ row }) => row?.product?.sale_price ?? row?.product?.price,
      className: "text-center",
    },
    {
      title: "Quantity",
      type: "number",
      render: ({ row }) => (
        <div className="flex justify-center">
          <input
            type="number"
            min={1}
            value={row.quantity}
            onChange={(e) =>
              update(row.product.id, parseInt(e.target.value, 10))
            }
            className="w-16 border rounded px-2 py-1 text-center bg-background"
          />
        </div>
      ),
      className: "text-center",
    },
    {
      title: "Subtotal",
      render: ({ row }) => {
        const unitPrice = row.product.sale_price ?? row.product.price;
        return (
          <div className="text-center font-medium">
            {unitPrice * row.quantity}
          </div>
        );
      },
    },
    {
      title: "Remove",
      render: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => {
              remove(row.product.id);
              setSelected(
                selected.filter((x) => x.product.id !== row.product.id)
              );
            }}
            className="text-muted-foreground hover:text-destructive"
            title="Remove item"
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      <div className=" mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-6">
          There are {cart.length} products in your cart
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Table */}
          <div className="lg:col-span-2">
            <MainTable<CartItemType>
              data={cart}
              isLoading={loading}
              columns={columns}
              rowId="product.id"
              selectedRows={selected ?? []}
              setSelectedRows={setSelected}
              tableClass="border border-border rounded-lg "
              tableInsideClass="border-b border-border text-left p-3"
            />
          </div>
          {/* Summary only for selected */}
          <div className="border rounded-lg p-6 space-y-3 h-fit">
            <>
              <div className="flex justify-between">
                <span>Selected Items</span>
                <span className="font-medium">{selectedCart?.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">Rs {selectedTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold text-lg">
                <span>Total</span>
                <span>Rs {selectedTotal}</span>
              </div>
              <Link href="/checkout">
                <Button className="w-full bg-primary text-white">
                  Proceed To Checkout →
                </Button>
              </Link>
            </>
          </div>
        </div>
      </div>
    </Screen>
  );
};

export default CartPage;
