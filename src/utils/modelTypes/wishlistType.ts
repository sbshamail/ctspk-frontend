import { ProductDataType } from ".";

export interface WishlistItemType {
  id: number;
  user_id: number;
  product_id: number;
  variation_option_id: number | null;
  product: ProductDataType;
}
