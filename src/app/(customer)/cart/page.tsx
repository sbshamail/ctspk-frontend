"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";
import { useState, useMemo } from "react";
import Link from "next/link";

const CartPage = () => {
  const { cart, update, remove, clear } = useCart();

  // State for selected items
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Derived: selected items list
  const selectedProducts = useMemo(
    () => cart.filter((item: any) => selectedItems.includes(item.id)),
    [cart, selectedItems]
  );

  // Derived: total only for selected
  const selectedTotal = useMemo(
    () =>
      selectedProducts.reduce(
        (acc, item) => acc + (item.salePrice ?? item.price) * item.quantity,
        0
      ),
    [selectedProducts]
  );

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item: any) => item.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (cart.length === 0) return <p className="p-6">Your cart is empty.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
      <p className="text-gray-500 mb-6">
        There are {cart.length} products in your cart
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Table */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-7 bg-gray-100 font-medium text-gray-600 px-4 py-2 items-center">
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

            {cart.map((item: any) => {
              const unitPrice = item.salePrice ?? item.price;
              const subtotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-7 items-center border-t px-4 py-3 text-sm"
                >
                  {/* Checkbox */}
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                    />
                  </div>

                  {/* Product */}
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {item?.image?.original ? (
                        <Image
                          src={item.image.thumbnail ?? item.image.original}
                          alt={item.slug}
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
                      <h2 className="font-medium">{item.name}</h2>
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
                      onChange={(e) =>
                        update(item.id, parseInt(e.target.value))
                      }
                      className="w-16 border rounded px-2 py-1 text-center"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="text-center font-medium">Rs {subtotal}</div>

                  {/* Remove */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => remove(item.id)}
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
                disabled={selectedItems.length === 0}
                onClick={() => selectedItems.forEach((id) => remove(id))}
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
          {selectedItems.length === 0 ? (
            <p className="text-gray-500">No products selected</p>
          ) : (
            <>
              <div className="flex justify-between">
                <span>Selected Items</span>
                <span className="font-medium">{selectedItems.length}</span>
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
              <Button className="w-full bg-primary text-white">
                Proceed To Checkout →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
