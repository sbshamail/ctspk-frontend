import { ImageType } from ".";

type Product = {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  image: ImageType;
};
export interface CartItemType {
  quantity: number;
  product: Product;
  shop_id: number;
}
