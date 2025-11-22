/**
 * Helper functions for order price calculations
 *
 * Price Field Definitions:
 * - unit_price: The actual price customer pays (after discount)
 * - sale_price: The original/regular price before discount (if exists)
 * - item_discount: Total discount for the product line (already includes quantity)
 * - subtotal: unit_price * quantity (what customer actually pays)
 */

export interface OrderProduct {
  order_quantity: string;
  unit_price: number;
  sale_price?: number;
  subtotal: number;
  item_discount?: number;
  [key: string]: any;
}

export interface OrderData {
  order_products: OrderProduct[];
  coupon_discount?: number;
  discount?: number;
  sales_tax?: number;
  delivery_fee?: number;
  total: number;
  [key: string]: any;
}

/**
 * Check if a product has a discount
 */
export const hasProductDiscount = (product: OrderProduct): boolean => {
  const regularPrice = product.sale_price || 0;
  const unitPrice = product.unit_price;
  return regularPrice > 0 && regularPrice > unitPrice;
};

/**
 * Get the regular price (before discount) for a product
 */
export const getRegularPrice = (product: OrderProduct): number => {
  if (product.sale_price && product.sale_price > product.unit_price) {
    return product.sale_price;
  }
  return product.unit_price;
};

/**
 * Calculate subtotal from all products (using regular prices)
 */
export const calculateOrderSubtotal = (products: OrderProduct[]): number => {
  return products.reduce((acc, product) => {
    const regularPrice = getRegularPrice(product);
    const quantity = parseFloat(product.order_quantity);
    return acc + (regularPrice * quantity);
  }, 0);
};

/**
 * Calculate total product discount
 * Note: item_discount already includes quantity
 */
export const calculateProductDiscount = (products: OrderProduct[]): number => {
  return products.reduce((acc, product) => {
    return acc + (product.item_discount || 0);
  }, 0);
};

/**
 * Get coupon discount (prioritize coupon_discount over discount)
 */
export const getCouponDiscount = (orderData: OrderData): number => {
  return orderData.coupon_discount || 0;
};

/**
 * Get general discount (only if no coupon discount)
 */
export const getGeneralDiscount = (orderData: OrderData): number => {
  return !orderData.coupon_discount && orderData.discount ? orderData.discount : 0;
};
