import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
const HeartIcon = () => {
  return (
    <Button variant="ghost" size="sm" className="relative hover:text-primary">
      <Heart className="w-5 h-5" />
      <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
        0
      </Badge>
    </Button>
  );
};

export default HeartIcon;
