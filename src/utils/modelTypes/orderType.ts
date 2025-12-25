// Order Status Enums
export enum OrderStatusEnum {
  PENDING = "order-pending",
  PROCESSING = "order-processing",
  COMPLETED = "order-completed",
  REFUNDED = "order-refunded",
  FAILED = "order-failed",
  CANCELLED = "order-cancelled",
  AT_LOCAL_FACILITY = "order-at-local-facility",
  OUT_FOR_DELIVERY = "order-out-for-delivery",
  AT_DISTRIBUTION_CENTER = "order-at-distribution-center",
  PACKED = "order-packed",
}

export enum PaymentStatusEnum {
  PENDING = "payment-pending",
  PROCESSING = "payment-processing",
  SUCCESS = "payment-success",
  FAILED = "payment-failed",
  REVERSAL = "payment-reversal",
  CASH_ON_DELIVERY = "payment-cash-on-delivery",
  CASH = "payment-cash",
  WALLET = "payment-wallet",
  AWAITING_APPROVAL = "payment-awaiting-for-approval",
}

export enum OrderItemType {
  SIMPLE = "simple",
  VARIABLE = "variable",
}

// Base Types
export interface TimeStampReadModel {
  created_at: string;
  updated_at: string;
}

export interface ProductOrderRead {
  image?: any;
  name: string;
}

// Order Product Types
export interface OrderProductRead extends TimeStampReadModel {
  id: number;
  order_id: number;
  product_id: number;
  product: ProductOrderRead;
  variation_option_id?: number;
  order_quantity: string;
  unit_price: number;
  sale_price?: number;
  subtotal: number;
  item_discount?: number;
  item_tax?: number;
  admin_commission: number;
  item_type: OrderItemType;
  variation_data?: any;
  product_snapshot?: any;
  variation_snapshot?: any;
  shop_id?: number;
  shop_name?: string;
  shop_slug?: string;
  review_id?: number;
  is_returned?: boolean;
  returned_quantity?: number;
  return_request_id?: number | null;
}

// Fulfillment Officer Types
export interface FulfillmentUserInfo {
  id: number;
  name: string;
  email: string;
  avatar?: {
    original?: string;
    thumbnail?: string;
    id?: number | null;
  };
}

// Order Status History Types
export interface OrderStatusRead extends TimeStampReadModel {
  id: number;
  order_id: number;
  language: string;
  order_pending_date?: string;
  order_processing_date?: string;
  order_completed_date?: string;
  order_refunded_date?: string;
  order_failed_date?: string;
  order_cancelled_date?: string;
  order_at_local_facility_date?: string;
  order_out_for_delivery_date?: string;
  order_packed_date?: string;
  order_at_distribution_center_date?: string;
}

// Main Order Types
export interface OrderRead extends TimeStampReadModel {
  id: number;
  tracking_number: string;
  customer_id?: number;
  customer_contact: string;
  customer_name?: string;
  amount: number;
  sales_tax?: number;
  paid_total?: number;
  total?: number;
  cancelled_amount: number;
  admin_commission_amount: number;
  language: string;
  coupon_id?: number;
  discount?: number;
  coupon_discount?: number;
  payment_gateway?: string;
  shipping_address?: any;
  billing_address?: any;
  logistics_provider?: number;
  delivery_fee?: number;
  delivery_time?: string;
  tax_id?: number;
  shipping_id?: number;
  order_status: OrderStatusEnum;
  payment_status: PaymentStatusEnum;
  fullfillment_id?: number;
  fullfillment_user_info?: FulfillmentUserInfo;
  assign_date?: string;
  shops?: any[];
  shop_count?: number;
  shipping_type?:string;
}

export interface OrderReadNested extends OrderRead {
  order_products: OrderProductRead[];
  order_status_history?: OrderStatusRead;
  order_review_id?: number | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

// Mutation Types
export interface CancelOrderRequest {
  order_id: number;
  reason?: string;
}

export interface ReturnItemCreate {
  order_item_id: number;
  quantity: number;
  reason?: string;
}

export interface ReturnRequestCreate {
  order_id: number;
  return_type: "full_order" | "single_product";
  reason: string;
  items: ReturnItemCreate[];
}

export interface ReviewCreate {
  order_id: number;
  product_id: number;
  shop_id: number;
  rating: number;
  comment?: string;
  variation_option_id?: number;
}