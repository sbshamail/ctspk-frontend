export interface CategoryDataType {
  [key: string]: any;
  id?: number;
  icon?: string;
  name: string;
  link?: string;
  children?: CategoryDataType[];
}

export interface ProductDataType {
  [key: string]: any;
  id?: number;
  title?: string;
  images?: string[];
  rating?: number;
  price?: number;
  salePrice?: number;
  reviews?: number;
  sku?: string;
  category?: { id: number; name: string };
}
