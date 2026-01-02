'use client';

import { useState, useCallback } from 'react';
import {
  JazzCashPaymentData,
  JazzCashInitResponse,
  JazzCashOTPResponse,
  getJazzCashErrorMessage,
} from '@/types/jazzcash';

export interface UseJazzCashReturn {
  isProcessing: boolean;
  awaitingOTP: boolean;
  transactionId: string | null;
  txnRefNo: string | null;
  error: string | null;
  initiatePayment: (data: JazzCashPaymentData) => Promise<JazzCashInitResponse>;
  verifyOTP: (otp: string) => Promise<JazzCashOTPResponse>;
  resetState: () => void;
  resetError: () => void;
}

export function useJazzCash(): UseJazzCashReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingOTP, setAwaitingOTP] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [txnRefNo, setTxnRefNo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(async (
    data: JazzCashPaymentData
  ): Promise<JazzCashInitResponse> => {
    setIsProcessing(true);
    setError(null);
    setAwaitingOTP(false);
    setTransactionId(null);
    setTxnRefNo(null);

    try {
      const response = await fetch('/api/jazzcash/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: JazzCashInitResponse = await response.json();

      if (result.success && result.transactionId) {
        setTransactionId(result.transactionId);
        setTxnRefNo(result.txnRefNo || result.transactionId);
        setAwaitingOTP(true);
        setIsProcessing(false);
        return result;
      } else {
        const errorMessage = result.error || getJazzCashErrorMessage(result.responseCode);
        setError(errorMessage);
        setIsProcessing(false);
        return {
          success: false,
          error: errorMessage,
          responseCode: result.responseCode,
        };
      }
    } catch (err) {
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        responseCode: 'NETWORK_ERROR',
      };
    }
  }, []);

  const verifyOTP = useCallback(async (otp: string): Promise<JazzCashOTPResponse> => {
    if (!transactionId || !txnRefNo) {
      const errorMessage = 'No active transaction. Please start a new payment.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        responseCode: '400',
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/jazzcash/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          txnRefNo,
          otp,
        }),
      });

      const result: JazzCashOTPResponse = await response.json();

      setIsProcessing(false);

      if (result.success && result.transactionStatus === 'SUCCESS') {
        setAwaitingOTP(false);
        return {
          success: true,
          transactionId,
          transactionStatus: 'SUCCESS',
          responseCode: '000',
          message: result.message || 'Payment successful',
        };
      } else {
        const errorMessage = result.error || getJazzCashErrorMessage(result.responseCode);
        setError(errorMessage);

        // If OTP expired, user needs to restart payment
        if (result.responseCode === 'OTP_EXPIRED') {
          setAwaitingOTP(false);
          setTransactionId(null);
          setTxnRefNo(null);
        }

        return {
          success: false,
          error: errorMessage,
          responseCode: result.responseCode,
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
        responseCode: 'NETWORK_ERROR',
        transactionStatus: 'FAILED',
      };
    }
  }, [transactionId, txnRefNo]);

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setAwaitingOTP(false);
    setTransactionId(null);
    setTxnRefNo(null);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    awaitingOTP,
    transactionId,
    txnRefNo,
    error,
    initiatePayment,
    verifyOTP,
    resetState,
    resetError,
  };
}
