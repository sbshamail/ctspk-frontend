import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
const ShoppingCartIcon = () => {
  return (
    <Button variant="ghost" size="sm" className="relative hover:text-primary">
      <ShoppingCart className="w-5 h-5" />
      <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
        3
      </Badge>
    </Button>
  );
};

export default ShoppingCartIcon;
