"use client";

import { useCart } from "@/context/cartContext";
import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";

const ShoppingCartIcon = () => {
  const { cart } = useCart();
  const count = cart.length;

  return (
    <>
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
          {count}
        </Badge>
      )}
    </>
  );
};

export default ShoppingCartIcon;
