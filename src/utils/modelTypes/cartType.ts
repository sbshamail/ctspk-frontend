// cartType.ts

// Define a simpler image type for cart items
type CartImageType = {
  original: string;
  thumbnail: string;
  filename?: string;
  id?: number;
};

// Define the VariationOption type based on your API response
type VariationOption = {
  id: number;
  title: string;
  price: string;
  sale_price?: string | null;
  purchase_price?: number;
  quantity: number;
  options: Record<string, any>;
  image: CartImageType;
  sku: string;
  bar_code?: string;
  is_active: boolean;
};

type Product = {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  image: CartImageType;
  // Add the missing properties that exist in your API response
  variation_options?: VariationOption[];
};

export interface CartItemType {
  id?: number; // cart id
  quantity: number;
  product: Product;
  shop_id: number;
  variation_option_id?: number | null;
}
