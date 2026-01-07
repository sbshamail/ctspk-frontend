'use client';

import { useEffect, useState, useCallback } from 'react';
import { PayFastPaymentData, PayFastResponse, PayFastCallbackResult } from '@/types/payfast';

// Check if we're in sandbox mode (redirect) or production (onsite modal)
const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true';

export function usePayFast() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PayFast engine.js script only in production mode (onsite modal)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // In sandbox mode, we use redirect - no script needed
    if (isSandbox) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already loaded
    if (document.getElementById('payfast-engine')) {
      if (typeof window.payfast_do_onsite_payment === 'function') {
        setIsLoaded(true);
      }
      return;
    }

    // Load PayFast script for production onsite modal
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
      // Step 1: Get payment data from backend API
      const response = await fetch(`/api/payfast/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result: PayFastResponse = await response.json();

      // Check for success
      const isSuccess = result.success === true || result.success === 1;

      if (!isSuccess) {
        setIsProcessing(false);
        const errorMessage = result.error || result.detail || 'Failed to initialize payment';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      // SANDBOX MODE: Redirect to PayFast payment page
      if (result.mode === 'redirect' && result.redirectUrl && result.paymentData) {
        // Create a form and submit it to redirect to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.redirectUrl;

        // PayFast requires fields in this exact order
        const fieldOrder = [
          'merchant_id',
          'merchant_key',
          'return_url',
          'cancel_url',
          'notify_url',
          'name_first',
          'name_last',
          'email_address',
          'm_payment_id',
          'amount',
          'item_name',
          'item_description',
          'signature',
        ];

        // Add payment data as hidden fields in the correct order
        const paymentData = result.paymentData;
        fieldOrder.forEach((key) => {
          if (paymentData && key in paymentData && paymentData[key]) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = paymentData[key] as string;
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit();

        // Return pending since we're redirecting
        return { success: true, message: 'Redirecting to PayFast...' };
      }

      // PRODUCTION MODE: Open PayFast onsite payment modal
      if (result.mode === 'onsite' && result.uuid) {
        const uuid = result.uuid;
        return new Promise((resolve) => {
          window.payfast_do_onsite_payment(
            { uuid },
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
      }

      // Fallback for legacy response format (uuid without mode)
      const paymentToken = result.uuid || result.data?.accessToken;
      if (paymentToken) {
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
      }

      setIsProcessing(false);
      setError('Invalid payment response');
      return { success: false, message: 'Invalid payment response' };

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
    isSandbox,
    error,
    initiatePayment,
    resetError,
  };
}
