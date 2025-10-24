import { ImageType } from ".";

// -------------------------------------
// Enums (same as backend choices)
// -------------------------------------
export type OrderStatusEnum =
  | "order-pending"
  | "order-processing"
  | "order-completed"
  | "order-refunded"
  | "order-failed"
  | "order-cancelled"
  | "order-at-local-facility"
  | "order-out-for-delivery"
  | "order-packed"
  | "order-at-distribution-center"
  | "order-packed";

export type PaymentStatusEnum = "pending" | "paid" | "unpaid" | "failed";

export type OrderItemType = "product" | "gift-card" | "subscription" | string;

// -------------------------------------
// Product types
// -------------------------------------
export interface ProductOrderRead {
  id: number;
  name: string;
  slug?: string;
  price: number;
  sale_price?: number;
  sku?: string;
  image?: ImageType;
  shop_id?: number;
  shop_name?: string;
  shop_slug?: string;
}

// -------------------------------------
// OrderProductRead
// -------------------------------------
export interface OrderProductRead {
  id: number;
  order_id: number;
  product_id: number;
  product: ProductOrderRead;
  variation_option_id?: number | null;
  order_quantity: string;
  unit_price: number;
  subtotal: number;
  admin_commission: number;
  item_type: OrderItemType;
  variation_data?: Record<string, any> | null;
  product_snapshot?: Record<string, any> | null;
  variation_snapshot?: Record<string, any> | null;
  shop_id?: number | null;
  shop_name?: string | null;
  shop_slug?: string | null;
}

// -------------------------------------
// OrderStatusRead
// -------------------------------------
export interface OrderStatusRead {
  id: number;
  order_id: number;
  language: string;
  order_pending_date?: string | null;
  order_processing_date?: string | null;
  order_completed_date?: string | null;
  order_refunded_date?: string | null;
  order_failed_date?: string | null;
  order_cancelled_date?: string | null;
  order_at_local_facility_date?: string | null;
  order_out_for_delivery_date?: string | null;
  order_packed_date?: string | null;
  order_at_distribution_center_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// -------------------------------------
// OrderRead (Base)
// -------------------------------------
export interface OrderReadType {
  id: number;
  tracking_number: string;
  customer_id?: number | null;
  customer_contact: string;
  customer_name?: string | null;
  amount: number;
  sales_tax?: number | null;
  paid_total?: number | null;
  total?: number | null;
  cancelled_amount: number;
  admin_commission_amount: number;
  language: string;
  coupon_id?: number | null;
  discount?: number | null;
  payment_gateway?: string | null;
  shipping_address?: Record<string, any> | null;
  billing_address?: Record<string, any> | null;
  logistics_provider?: number | null;
  delivery_fee?: number | null;
  delivery_time?: string | null;
  order_status: OrderStatusEnum;
  payment_status: PaymentStatusEnum;
  fullfillment_id?: number | null;
  assign_date?: string | null;
  shops?: Record<string, any>[] | null;
  shop_count?: number | null;
  created_at?: string;
  updated_at?: string;
}

// -------------------------------------
// OrderReadNested (extends OrderRead)
// -------------------------------------
export interface OrderReadNestedType extends OrderReadType {
  order_products: OrderProductRead[];
  order_status_history?: OrderStatusRead | null;
}
