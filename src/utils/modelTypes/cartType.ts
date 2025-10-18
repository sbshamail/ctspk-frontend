import { ImageType } from ".";

type Product = {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  image: ImageType;
};
export interface CartItemType {
  id?: number; //cart id
  quantity: number;
  product: Product;
  shop_id: number;
}
