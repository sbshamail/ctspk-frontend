"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";

const CartPage = () => {
  const { cart, update, remove, clear } = useCart();

  const total = cart.reduce(
    (acc, item) => acc + (item.salePrice ?? item.price) * item.quantity,
    0
  );

  if (cart.length === 0) return <p className="p-6">Your cart is empty.</p>;
  console.log(cart);
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      <div className="space-y-4">
        {cart?.map((item) => (
          <div
            key={item?.id}
            className="flex items-center justify-between border p-3 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Image
                // @ts-ignore
                src={item?.image?.original}
                alt={item?.name}
                width={64}
                height={64}
                className="rounded"
              />
              <div>
                <h2 className="font-medium">{item?.name}</h2>
                <p className="text-sm text-gray-500">
                  ${(item?.salePrice ?? item?.price).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                value={item?.quantity}
                onChange={(e) => update(item?.id, parseInt(e.target.value))}
                className="w-16 border rounded px-2 py-1"
              />
              <Button variant="destructive" onClick={() => remove(item?.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center border-t pt-4">
        <h2 className="text-lg font-semibold">Total: {total.toFixed(2)} Rs</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clear}>
            Clear Cart
          </Button>
          <Button className="bg-primary text-white">Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
