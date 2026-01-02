// EasyPaisa Payment Gateway Types

export interface EasyPaisaConfig {
  storeId: string;
  storePassword: string;
  accountNumber: string;
  apiUrl: string;
}

export interface EasyPaisaPaymentData {
  orderId: string;
  amount: number;
  mobileNumber: string;
  customerEmail: string;
  customerName: string;
}

export interface EasyPaisaInitResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  message?: string;
  error?: string;
  errorCode?: string;
}

export interface EasyPaisaOTPVerifyData {
  transactionId: string;
  otp: string;
  orderId: string;
}

export interface EasyPaisaOTPResponse {
  success: boolean;
  message?: string;
  transactionStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId?: string;
  error?: string;
  errorCode?: string;
}

export interface EasyPaisaCallbackData {
  orderRefNumber: string;
  transactionId: string;
  transactionStatus: string;
  transactionAmount: string;
  msisdn: string;
  checksum: string;
}

// Error codes mapping for user-friendly messages
export const EASYPAISA_ERROR_MESSAGES: Record<string, string> = {
  '0001': 'Transaction failed. Please try again.',
  '0002': 'Insufficient balance in your EasyPaisa account.',
  '0003': 'Invalid mobile number. Please check and try again.',
  '0004': 'OTP verification failed. Please try again.',
  '0005': 'OTP has expired. Please request a new one.',
  '0006': 'Transaction timeout. Please try again.',
  '0007': 'Mobile account not found. Please check your number.',
  '0008': 'Daily transaction limit exceeded.',
  '0009': 'Service temporarily unavailable. Please try later.',
  'NETWORK_ERROR': 'Network error. Please check your connection.',
  'UNKNOWN': 'An unexpected error occurred. Please try again.',
};

// Get user-friendly error message
export function getEasyPaisaErrorMessage(errorCode?: string): string {
  if (!errorCode) return EASYPAISA_ERROR_MESSAGES['UNKNOWN'];
  return EASYPAISA_ERROR_MESSAGES[errorCode] || EASYPAISA_ERROR_MESSAGES['UNKNOWN'];
}
