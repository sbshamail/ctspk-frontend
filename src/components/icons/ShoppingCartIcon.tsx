"use client";

import { useCartService } from "@/lib/cartService";
import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const ShoppingCartIcon = () => {
  const { cart } = useCartService();
  const count = cart.length;
  const totalQuantity = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Button variant="ghost" size="sm" className="relative hover:text-primary">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
          {count}
        </Badge>
      )}
    </Button>
  );
};

export default ShoppingCartIcon;
