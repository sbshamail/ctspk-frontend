'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  PaymentMethod,
  fallbackPaymentMethods,
  getActivePaymentMethods,
  getPaymentMethodById,
  getDefaultPaymentMethodId,
} from '@/config/paymentMethods';

/**
 * Hook to get available payment methods from settings API (via localStorage)
 *
 * Payment methods are loaded from:
 * 1. localStorage 'paymentGateway' key (populated by SettingsProvider from API)
 * 2. localStorage 'siteSettings.paymentGateway' key (alternative location)
 * 3. Fallback to default configuration if not available
 */
export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>(fallbackPaymentMethods);
  const [isLoading, setIsLoading] = useState(true);

  // Load payment methods from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get from dedicated paymentGateway key first
      let paymentGateway = localStorage.getItem('paymentGateway');

      // If not found, try from siteSettings
      if (!paymentGateway) {
        const siteSettings = localStorage.getItem('siteSettings');
        if (siteSettings) {
          const settings = JSON.parse(siteSettings);
          if (settings.paymentGateway) {
            paymentGateway = JSON.stringify(settings.paymentGateway);
          }
        }
      }

      // Parse and set methods if found
      if (paymentGateway) {
        const parsed = JSON.parse(paymentGateway);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMethods(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods from localStorage:', error);
      // Keep fallback methods
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get active methods (filtered and sorted)
  const availableMethods = useMemo(() => {
    return getActivePaymentMethods(methods);
  }, [methods]);

  // Get default payment method ID
  const defaultMethodId = useMemo(() => {
    return getDefaultPaymentMethodId(methods);
  }, [methods]);

  // Get method by ID
  const getMethodById = useCallback((id: string): PaymentMethod | undefined => {
    return getPaymentMethodById(methods, id);
  }, [methods]);

  // Check if a method is available
  const isMethodAvailable = useCallback((id: string): boolean => {
    return availableMethods.some(method => method.id === id);
  }, [availableMethods]);

  return {
    methods,           // All methods (including inactive)
    availableMethods,  // Only active methods, sorted
    defaultMethodId,   // First active method's ID
    isLoading,         // Loading state
    getMethodById,     // Get method by ID
    isMethodAvailable, // Check if method is available
  };
}
