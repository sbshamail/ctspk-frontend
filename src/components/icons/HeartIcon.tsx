import { getAuth } from "@/action/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetWishlistQuery } from "@/store/services/wishlistAPi";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
const HeartIcon = () => {
  const { user } = getAuth();
  // Wishlist
  const {
    data: wishlist,
    isLoading,
    isFetching,
  } = useGetWishlistQuery(undefined, {
    skip: !user, // don’t run query if not logged in
  });
  if (isLoading || isFetching) {
    return <Skeleton className="w-5 h-5" />;
  }
  return (
    <Button variant="ghost" size="sm" className="relative hover:text-primary">
      <Heart className={cn("w-5 h-5")} />
      <Badge className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center p-0">
        {wishlist?.total}
      </Badge>
    </Button>
  );
};

export default HeartIcon;
