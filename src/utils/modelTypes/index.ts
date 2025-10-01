export interface CategoryDataType {
  [key: string]: any;
  id?: number;
  image?: string;
  is_active: boolean;
  name: string;
  slug: string;
  children?: CategoryDataType[];
  created_at: string;
  parent_id?: number;
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
