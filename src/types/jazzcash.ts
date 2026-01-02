// JazzCash Payment Gateway Types

export interface JazzCashConfig {
  merchantId: string;
  password: string;
  integritySalt: string;
  apiUrl: string;
  returnUrl: string;
}

export interface JazzCashPaymentData {
  orderId: string;
  amount: number;
  mobileNumber: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}

export interface JazzCashInitResponse {
  success: boolean;
  transactionId?: string;
  txnRefNo?: string;
  message?: string;
  error?: string;
  responseCode?: string;
}

export interface JazzCashOTPVerifyData {
  transactionId: string;
  otp: string;
  txnRefNo: string;
}

export interface JazzCashOTPResponse {
  success: boolean;
  message?: string;
  transactionStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId?: string;
  responseCode?: string;
  error?: string;
}

export interface JazzCashCallbackData {
  pp_TxnRefNo: string;
  pp_TxnDateTime: string;
  pp_Amount: string;
  pp_ResponseCode: string;
  pp_ResponseMessage: string;
  pp_SecureHash: string;
  pp_BankID?: string;
  pp_MerchantID: string;
  pp_Version: string;
}

// JazzCash response codes mapping
export const JAZZCASH_RESPONSE_CODES: Record<string, { success: boolean; message: string }> = {
  '000': { success: true, message: 'Transaction successful' },
  '001': { success: false, message: 'Transaction pending' },
  '002': { success: false, message: 'Transaction failed' },
  '124': { success: false, message: 'Insufficient balance in your JazzCash account.' },
  '157': { success: false, message: 'Transaction declined. Please try again.' },
  '210': { success: false, message: 'Invalid mobile number format.' },
  '400': { success: false, message: 'Invalid request. Please try again.' },
  '401': { success: false, message: 'Authentication failed. Please contact support.' },
  '403': { success: false, message: 'Transaction not permitted.' },
  '404': { success: false, message: 'Mobile account not found.' },
  '500': { success: false, message: 'System error. Please try another payment method.' },
  '999': { success: false, message: 'System error. Please try another payment method.' },
};

// Error codes mapping for user-friendly messages
export const JAZZCASH_ERROR_MESSAGES: Record<string, string> = {
  'INVALID_OTP': 'Invalid OTP. Please try again.',
  'OTP_EXPIRED': 'OTP has expired. Please request a new one.',
  'INSUFFICIENT_BALANCE': 'Insufficient balance in your JazzCash account.',
  'INVALID_MOBILE': 'Invalid mobile number. Please check and try again.',
  'TRANSACTION_LIMIT': 'Daily transaction limit exceeded.',
  'NETWORK_ERROR': 'Network error. Please check your connection.',
  'TIMEOUT': 'Transaction timeout. Please try again.',
  'UNKNOWN': 'An unexpected error occurred. Please try again.',
};

// Get user-friendly error message from response code
export function getJazzCashErrorMessage(responseCode?: string, errorType?: string): string {
  if (errorType && JAZZCASH_ERROR_MESSAGES[errorType]) {
    return JAZZCASH_ERROR_MESSAGES[errorType];
  }
  if (responseCode && JAZZCASH_RESPONSE_CODES[responseCode]) {
    return JAZZCASH_RESPONSE_CODES[responseCode].message;
  }
  return JAZZCASH_ERROR_MESSAGES['UNKNOWN'];
}

// Check if response code indicates success
export function isJazzCashSuccess(responseCode: string): boolean {
  return responseCode === '000';
}
