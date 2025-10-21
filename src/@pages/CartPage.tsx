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
import { useMemo } from "react";
// Types
import { CartItemType } from "@/utils/modelTypes";

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

  useMountFirstEffect(() => {
    dispatch(setSelectedCart(cart));
  }, [cart]);

  useMountAfterEffect(() => {
    setSelectedCart(cart);
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

  // const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;
  const isAllSelected = cart.length > 0 && selectedCart?.length === cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      dispatch(setSelectedCart([]));
    } else {
      dispatch(setSelectedCart(cart));
    }
  };

  const toggleSelectOne = (item: CartItemType) => {
    dispatch(
      setSelectedCart(
        selectedCart &&
          selectedCart.some((x) => x.product.id === item.product.id)
          ? selectedCart.filter((x) => x.product.id !== item.product.id)
          : [...(selectedCart ?? []), item]
      )
    );
  };

  if (loading) return <LayoutSkeleton main={true} />;

  if (cart.length === 0)
    return (
      <Screen>
        <p className="p-6">Your cart is empty.</p>
      </Screen>
    );
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
            <div className="border rounded-lg overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-7 bg-muted font-medium text-muted-foreground px-4 py-2 items-center">
                <div>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="col-span-2">Product</div>
                <div className="text-center">Unit Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Subtotal</div>
                <div className="text-center">Remove</div>
              </div>

              {cart?.map((item: CartItemType) => {
                const { sale_price, price, name, image, id } =
                  item.product || {};
                const unitPrice = sale_price ?? price;
                const subtotal = unitPrice * item.quantity;

                return (
                  <div
                    key={id}
                    className="grid grid-cols-7 items-center border-t px-4 py-3 text-sm"
                  >
                    {/* Checkbox */}
                    <div>
                      <input
                        type="checkbox"
                        // checked={selectedItems.includes(id)}
                        checked={selectedCart?.some(
                          (x) => x?.product?.id === id
                        )}
                        onChange={() => toggleSelectOne(item)}
                      />
                    </div>

                    {/* Product */}
                    <div className="col-span-2 flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {image?.original ? (
                          <Image
                            src={image?.thumbnail ?? image.original ?? image}
                            alt={name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            Product Image
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="font-medium">{name}</h2>
                        {/* <p className="text-xs text-gray-500">★★★★☆ (4.0)</p> */}
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="text-center">Rs {unitPrice}</div>

                    {/* Quantity */}
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => update(id, parseInt(e.target.value))}
                        className="w-16 border rounded px-2 py-1 text-center"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="text-center font-medium">Rs {subtotal}</div>

                    {/* Remove */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => remove(id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between mt-4">
              <Link href="/product">
                <Button variant="outline">← Continue Shopping</Button>
              </Link>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={selectedCart?.length === 0}
                  onClick={() =>
                    removeSelected(
                      selectedCart?.map((x) => x?.product?.id) ?? []
                    )
                  }
                >
                  Remove Selected
                </Button>
                <Button onClick={clear} variant="outline">
                  Clear Cart
                </Button>
              </div>
            </div>
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
