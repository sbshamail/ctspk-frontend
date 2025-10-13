"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";
import { ImageType } from "@/utils/modelTypes";

interface Props {
  product: {
    id: number;
    name: string;
    image: ImageType;
    price: number;
    salePrice?: number;
    max_price?: number;
    min_price?: number;
    category: { id: number; name: string };
    slug: string;
    gallery?: ImageType[];
    rating: number;
    description: string;
    quantity: number;
    shop: {
      id: number;
      name: string;
    };
  };
}

const SingleProductAddToCart = ({ product }: Props) => {
  const { cart, add, update } = useCart();

  // find if product already in cart
  const existingItem = cart.find((item) => item.id === product.id);
  const quantity = existingItem?.quantity ?? 1;
  const quota = product.quantity ?? 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      update(product.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < quota) {
      // if not in cart, add first
      if (!existingItem) {
        add({
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          image: product.image,
          quantity: 1,
          shop_id: product.shop.id,
        });
      } else {
        update(product.id, quantity + 1);
      }
    }
  };

  const handleAddToCart = () => {
    if (!existingItem) {
      add({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.image,
        quantity: 1,
        shop_id: product.shop.id,
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Quantity Control */}
      <div className="flex items-center border rounded-lg">
        <button
          onClick={handleDecrease}
          className="px-3 py-2 hover:bg-muted transition-colors"
        >
          -
        </button>
        <span className="px-4 py-2 border-x">{quantity}</span>
        <button
          onClick={handleIncrease}
          className="px-3 py-2 hover:bg-muted transition-colors"
        >
          +
        </button>
      </div>

      {/* Add to Cart Button (only if not already added) */}
      {!existingItem && (
        <Button
          onClick={handleAddToCart}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Add to Cart
        </Button>
      )}
    </div>
  );
};

export default SingleProductAddToCart;
