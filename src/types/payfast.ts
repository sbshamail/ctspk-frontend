export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  testMode: boolean;
}

export interface PayFastPaymentData {
  orderId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
}

export interface PayFastResponse {
  success: boolean;
  uuid?: string;
  error?: string;
  paymentData?: Record<string, string>;
}

export interface PayFastCallbackResult {
  success: boolean;
  message?: string;
}

// Declare the global PayFast function from engine.js
declare global {
  interface Window {
    payfast_do_onsite_payment: (
      options: { uuid: string },
      callback?: (result: boolean) => void
    ) => void;
  }
}
