'use client';

import { useState, useCallback } from 'react';
import {
  EasyPaisaPaymentData,
  EasyPaisaInitResponse,
  EasyPaisaOTPResponse,
  getEasyPaisaErrorMessage,
} from '@/types/easypaisa';

export interface UseEasyPaisaReturn {
  isProcessing: boolean;
  awaitingOTP: boolean;
  transactionId: string | null;
  orderId: string | null;
  error: string | null;
  initiatePayment: (data: EasyPaisaPaymentData) => Promise<EasyPaisaInitResponse>;
  verifyOTP: (otp: string) => Promise<EasyPaisaOTPResponse>;
  resetState: () => void;
  resetError: () => void;
}

export function useEasyPaisa(): UseEasyPaisaReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingOTP, setAwaitingOTP] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(async (
    data: EasyPaisaPaymentData
  ): Promise<EasyPaisaInitResponse> => {
    setIsProcessing(true);
    setError(null);
    setAwaitingOTP(false);
    setTransactionId(null);
    setOrderId(data.orderId);

    try {
      const response = await fetch('/api/easypaisa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: EasyPaisaInitResponse = await response.json();

      if (result.success && result.transactionId) {
        setTransactionId(result.transactionId);
        setAwaitingOTP(true);
        setIsProcessing(false);
        return result;
      } else {
        const errorMessage = result.error || getEasyPaisaErrorMessage(result.errorCode);
        setError(errorMessage);
        setIsProcessing(false);
        return {
          success: false,
          error: errorMessage,
          errorCode: result.errorCode,
        };
      }
    } catch (err) {
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }, []);

  const verifyOTP = useCallback(async (otp: string): Promise<EasyPaisaOTPResponse> => {
    if (!transactionId || !orderId) {
      const errorMessage = 'No active transaction. Please start a new payment.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorCode: '0001',
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/easypaisa/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          orderId,
          otp,
        }),
      });

      const result: EasyPaisaOTPResponse = await response.json();

      setIsProcessing(false);

      if (result.success && result.transactionStatus === 'SUCCESS') {
        setAwaitingOTP(false);
        return {
          success: true,
          transactionId,
          transactionStatus: 'SUCCESS',
          message: result.message || 'Payment successful',
        };
      } else {
        const errorMessage = result.error || getEasyPaisaErrorMessage(result.errorCode);
        setError(errorMessage);

        // If OTP expired, user needs to restart payment
        if (result.errorCode === '0005') {
          setAwaitingOTP(false);
          setTransactionId(null);
        }

        return {
          success: false,
          error: errorMessage,
          errorCode: result.errorCode,
          transactionStatus: 'FAILED',
        };
      }
    } catch (err) {
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorCode: 'NETWORK_ERROR',
        transactionStatus: 'FAILED',
      };
    }
  }, [transactionId, orderId]);

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setAwaitingOTP(false);
    setTransactionId(null);
    setOrderId(null);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    awaitingOTP,
    transactionId,
    orderId,
    error,
    initiatePayment,
    verifyOTP,
    resetState,
    resetError,
  };
}
