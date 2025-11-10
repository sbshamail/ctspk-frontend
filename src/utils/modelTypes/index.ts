export interface ImageType {
  original: string;
  filename: string;
  thumbnail?: string;
  media_type?: string;
}
export * from "./AuthType";
export * from "./cartType";
export * from "./productType";
export * from "./wishlistType";

export interface CategoryDataType {
  [key: string]: any;
  id?: number;
  image?: ImageType;
  description?: string;
  root_id: number;
  is_active: boolean;
  name: string;
  slug: string;
  children?: CategoryDataType[];
  created_at: string;
  parent_id?: number;
}
