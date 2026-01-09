/**
 * Payment Methods Configuration
 *
 * This file defines the TypeScript types and provides a fallback configuration.
 * The actual payment methods are fetched from the settings API (paymentGateway key).
 *
 * Backend should return paymentGateway in settings API response:
 * {
 *   "success": 1,
 *   "data": {
 *     "options": {
 *       "paymentGateway": [
 *         {
 *           "id": "payfast",
 *           "name": "Pay with Card",
 *           "description": "Secure card payment via PayFast",
 *           "image": "/assets/imgs/payfast-logo.svg",
 *           "active": true,
 *           "sortOrder": 1,
 *           "requiresWalletNumber": false,
 *           "walletNumberLabel": null
 *         },
 *         ...
 *       ]
 *     }
 *   }
 * }
 */

export interface PaymentMethod {
  id: string;                     // Unique identifier (sent to API as payment_gateway)
  name: string;                   // Display name
  description?: string;           // Optional description
  image: string;                  // Image path or URL
  active: boolean;                // Whether this method is enabled
  sortOrder: number;              // Display order (lower = first)
  requiresWalletNumber?: boolean; // Whether mobile wallet number input is needed
  walletNumberLabel?: string;     // Label for wallet number input (e.g., "EasyPaisa Mobile Number")
}

/**
 * Fallback Payment Methods Configuration
 * Used when API doesn't return paymentGateway or for initial load
 *
 * To disable a method by default, set active: false
 */
export const fallbackPaymentMethods: PaymentMethod[] = [
  {
    id: 'payfast',
    name: 'Pay with Card',
    description: 'Secure card payment via PayFast',
    image: '/assets/imgs/payfast-logo.svg',
    active: true,
    sortOrder: 1,
    requiresWalletNumber: false,
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    description: 'Pay with your EasyPaisa mobile wallet',
    image: '/assets/imgs/easypaisa.png',
    active: true,
    sortOrder: 2,
    requiresWalletNumber: true,
    walletNumberLabel: 'EasyPaisa Mobile Number',
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    description: 'Pay with your JazzCash mobile wallet',
    image: '/assets/imgs/jazzcash.png',
    active: true,
    sortOrder: 3,
    requiresWalletNumber: true,
    walletNumberLabel: 'JazzCash Mobile Number',
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash On Delivery',
    description: 'Pay when your order arrives',
    image: '/assets/imgs/cash-icon.png',
    active: true,
    sortOrder: 4,
    requiresWalletNumber: false,
  },
];

/**
 * Get active payment methods sorted by sortOrder
 */
export function getActivePaymentMethods(methods: PaymentMethod[]): PaymentMethod[] {
  return methods
    .filter(method => method.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get a payment method by ID
 */
export function getPaymentMethodById(methods: PaymentMethod[], id: string): PaymentMethod | undefined {
  return methods.find(method => method.id === id);
}

/**
 * Get default payment method ID (first active method)
 */
export function getDefaultPaymentMethodId(methods: PaymentMethod[]): string {
  const activeMethods = getActivePaymentMethods(methods);
  return activeMethods.length > 0 ? activeMethods[0].id : 'cash_on_delivery';
}
