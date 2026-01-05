'use client';

import { useEffect, useState, useCallback } from 'react';
import { PayFastPaymentData, PayFastResponse, PayFastCallbackResult } from '@/types/payfast';
import { API_URL } from '../../config';

export function usePayFast() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PayFast engine.js script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (document.getElementById('payfast-engine')) {
      if (typeof window.payfast_do_onsite_payment === 'function') {
        setIsLoaded(true);
      }
      return;
    }

    // Development mock for testing (PayFast Onsite doesn't work in sandbox)
    if (process.env.NODE_ENV === 'development') {
      window.payfast_do_onsite_payment = (options, callback) => {
        console.log('Mock PayFast payment initiated:', options);
        // Simulate payment modal and success after 2 seconds
        setTimeout(() => {
          console.log('Mock PayFast payment completed');
          callback?.(true);
        }, 2000);
      };
      setIsLoaded(true);
      return;
    }

    // Load PayFast script in production
    const script = document.createElement('script');
    script.id = 'payfast-engine';
    script.src = 'https://www.payfast.co.za/onsite/engine.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load PayFast payment system');
      setIsLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup is optional since we want to keep the script loaded
    };
  }, []);

  const initiatePayment = useCallback(async (
    paymentData: PayFastPaymentData
  ): Promise<PayFastCallbackResult> => {
    if (!isLoaded) {
      return { success: false, message: 'PayFast payment system is not ready yet' };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Get payment identifier (UUID) from backend API
      const response = await fetch(`${API_URL}/payment/payfast/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result: PayFastResponse = await response.json();

      // Check for success (can be boolean true or number 1)
      const isSuccess = result.success === true || result.success === 1;
      // Get token from uuid (legacy) or data.accessToken (new API format)
      const paymentToken = result.uuid || result.data?.accessToken;

      if (!isSuccess || !paymentToken) {
        setIsProcessing(false);
        const errorMessage = result.error || result.detail || 'Failed to initialize payment';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      // Step 2: Open PayFast onsite payment modal
      return new Promise((resolve) => {
        window.payfast_do_onsite_payment(
          { uuid: paymentToken },
          (paymentResult: boolean) => {
            setIsProcessing(false);
            if (paymentResult === true) {
              resolve({ success: true, message: 'Payment completed successfully' });
            } else {
              resolve({ success: false, message: 'Payment was cancelled or failed' });
            }
          }
        );
      });
    } catch (err) {
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [isLoaded]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoaded,
    isProcessing,
    error,
    initiatePayment,
    resetError,
  };
}
