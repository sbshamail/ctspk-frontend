export interface ImageType {
  original: string;
  filename: string;
  thumbnail?: string;
  media_type?: string;
}
export * from "./AuthType";

export interface CategoryDataType {
  [key: string]: any;
  id?: number;
  image?: ImageType;
  is_active: boolean;
  name: string;
  slug: string;
  children?: CategoryDataType[];
  created_at: string;
  parent_id?: number;
}

export interface ProductDataType {
  [key: string]: any;
  id: number;
  name: string;
  gallery?: ImageType[];
  image?: ImageType;
  rating?: number;
  price?: number;
  salePrice?: number;
  reviews?: number;
  sku?: string;
  category?: { id: number; name: string };
}
