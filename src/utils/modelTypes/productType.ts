// ===============================
// Product Type (Full Frontend Model)
// ===============================

import { ImageType } from ".";

export interface ProductDataType {
  id: number;
  name: string;
  description?: string | null;
  slug: string;
  price: number;
  sale_price?: number;
  max_price?: number;
  min_price?: number;
  purchase_price?: number;
  weight?: number | null;
  image?: ImageType;
  gallery?: Record<string, any>[] | null;
  is_active: boolean;
  is_feature?: boolean | null;
  quantity: number;
  status: string; // ProductStatus Enum on backend
  product_type: string; // ProductType Enum on backend
  category: CategoryReadProductType;
  shop: ShopReadForProductType;
  manufacturer_id?: number | null;
  in_stock: boolean;
  unit?: string | null;
  dimension_unit?: string | null;
  sku?: string | null;
  height?: number | null;
  width?: number | null;
  length?: number | null;
  warranty?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  return_policy?: string | null;
  shipping_info?: string | null;
  tags?: string[] | null;
  bar_code?: string | null;
  attributes?: ProductAttributeType[] | null;
  variations?: VariationOptionReadForProductType[] | null;
  variations_count?: number;
  total_quantity?: number;
  total_purchased_quantity: number;
  total_sold_quantity: number;
  current_stock_value?: number | null;
  created_at?: string;
  updated_at?: string;
}

// ===============================
// Sub Types
// ===============================

// ✅ Category
export interface CategoryReadProductType {
  id: number;
  name: string;
  slug: string;
  root_id: number;
  parent_id?: number | null;
}

// ✅ Shop
export interface ShopReadForProductType {
  id: number;
  name?: string | null;
}

// ✅ Variation Option
export interface VariationOptionReadForProductType {
  id: number;
  title: string;
  price: string;
  sale_price?: string | null;
  purchase_price?: number | null;
  quantity: number;
  options: Record<string, any>;
  image?: Record<string, any> | null;
  sku?: string | null;
  bar_code?: string | null;
  is_active: boolean;
}

// ✅ Product Attribute (placeholder type, since not fully defined in backend snippet)
// ✅ Product Attribute
export interface ProductAttributeType {
  id: number;
  name: string;
  values: ProductAttributeValueType[];
  selected_values?: number[] | null;
  is_visible: boolean;
  is_variation: boolean;
}

// ✅ Product Attribute Value
export interface ProductAttributeValueType {
  id: number;
  value: string;
  meta?: Record<string, any> | null; // optional additional info (if backend provides)
}
