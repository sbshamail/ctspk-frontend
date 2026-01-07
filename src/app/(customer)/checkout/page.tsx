"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Screen } from "@/@core/layout";
import { fetchApi } from "@/action/fetchApi";
import { toast } from "sonner";

import { useSelection } from "@/lib/useSelection";
import { currencyFormatter } from "@/utils/helper";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cartContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePayFast } from "@/hooks/usePayFast";
import { useEasyPaisa } from "@/hooks/useEasyPaisa";
import { useJazzCash } from "@/hooks/useJazzCash";
import { OTPVerificationModal } from "@/components/OTPVerificationModal";

// Create a complete checkout schema from scratch
const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().optional().default(""),
  country: z.string().optional().default("Pakistan"),
  phone: z.string().min(1, "Phone number is required"),
  mobile_wallet_number: z.string().optional().default(""), // For EasyPaisa/JazzCash
  delivery_time: z.string().min(1, "Delivery time is required"),
  billing_address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional().default("Federal"),
    postal_code: z.string().optional().default(""),
    country: z.string().optional().default("Pakistan"),
  }),
});

// Helper function to get variation display text
const getVariationDisplayText = (item: any): string => {
  if (!item.variation_option_id || !item.product.variation_options) return "";

  const variation = item.product.variation_options.find(
    (v: any) => v.id === item.variation_option_id
  );

  if (!variation) return "";

  if (variation.title) {
    return variation.title;
  }

  if (variation.options) {
    return Object.entries(variation.options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  return "";
};

// Helper function to get effective price for cart items
const getEffectivePrice = (item: any): number => {
  // For variable products, use variation price if available
  if (item.variation_option_id && item.product.variation_options) {
    const variation = item.product.variation_options.find(
      (v: any) => v.id === item.variation_option_id
    );
    if (variation?.price) {
      return parseFloat(variation.price) || 0; // 🔴 FIX: Added null check
    }
  }
  // For simple products, use sale price if available, otherwise regular price
  const salePrice = item.product.sale_price || 0; // 🔴 FIX: Added null check
  const regularPrice = item.product.price || 0; // 🔴 FIX: Added null check

  return salePrice > 0 ? salePrice : regularPrice;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");
  const isAuth = !!auth?.user?.id;
  const { refetchCart, cart, removeSelected, clear } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = auth || {};
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(!isAuth);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("cash_on_delivery");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [billingIsDefault, setBillingIsDefault] = useState(false);
  const [shippingIsDefault, setShippingIsDefault] = useState(false);

  // New state for tax, shipping, coupon, and delivery time
  const [taxClass, setTaxClass] = useState<any>(null);
  const [shippingClass, setShippingClass] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoadingTaxShipping, setIsLoadingTaxShipping] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState<any[]>([]);
  const [isLoadingDeliveryTimes, setIsLoadingDeliveryTimes] = useState(true);
  // Free shipping settings from siteSettings
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingAmount, setFreeShippingAmount] = useState(0);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
  // API error states
  const [shippingError, setShippingError] = useState(false);
  const [taxError, setTaxError] = useState(false);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  // PayFast hook
  const { isLoaded: isPayFastLoaded, isProcessing: isPayFastProcessing, initiatePayment: initiatePayFastPayment, error: payFastError } = usePayFast();

  // EasyPaisa hook
  const {
    isProcessing: isEasyPaisaProcessing,
    awaitingOTP: isEasyPaisaAwaitingOTP,
    transactionId: easyPaisaTransactionId,
    error: easyPaisaError,
    initiatePayment: initiateEasyPaisaPayment,
    verifyOTP: verifyEasyPaisaOTP,
    resetState: resetEasyPaisaState,
    resetError: resetEasyPaisaError,
  } = useEasyPaisa();

  // JazzCash hook
  const {
    isProcessing: isJazzCashProcessing,
    awaitingOTP: isJazzCashAwaitingOTP,
    transactionId: jazzCashTransactionId,
    error: jazzCashError,
    initiatePayment: initiateJazzCashPayment,
    verifyOTP: verifyJazzCashOTP,
    resetState: resetJazzCashState,
    resetError: resetJazzCashError,
  } = useJazzCash();

  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpPaymentMethod, setOtpPaymentMethod] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");

  // Payment success state - to handle order creation retry without re-payment
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedPaymentData, setCompletedPaymentData] = useState<{
    paymentId: string;
    paymentResponse: any;
    orderData: any;
  } | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Initialize with tomorrow's date as default
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  // Set mounted state for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch addresses if user is authenticated
  useEffect(() => {
    if (isAuth && user?.id) {
      fetchAddresses();
      fetchWalletBalance();
    }
  }, [isAuth, user?.id]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!isAuth) return;

    setIsLoadingWallet(true);
    try {
      const res = await fetchApi({
        url: "wallet/balance",
        method: "GET",
      });

      if (res?.success === 1 && res.data) {
        setWalletBalance(res.data.balance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      setWalletBalance(0);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Load settings from localStorage and fetch shipping/tax data from API
  useEffect(() => {
    loadSettingsAndFetchData();
  }, []);

  const loadSettingsAndFetchData = async () => {
    try {
      setIsLoadingTaxShipping(true);
      setIsLoadingDeliveryTimes(true);

      // Get siteSettings from localStorage
      const siteSettingsStr = localStorage.getItem("siteSettings");

      if (!siteSettingsStr) {
        setShippingError(true);
        setTaxError(true);
        setIsLoadingTaxShipping(false);
        setIsLoadingDeliveryTimes(false);
        return;
      }

      const siteSettings = JSON.parse(siteSettingsStr);

      // Get deliveryTime from siteSettings
      if (siteSettings.deliveryTime) {
        const deliveryTimeData = siteSettings.deliveryTime;
        if (Array.isArray(deliveryTimeData)) {
          setDeliveryTimes(deliveryTimeData);
        } else if (typeof deliveryTimeData === "string") {
          try {
            const parsedData = JSON.parse(deliveryTimeData);
            setDeliveryTimes(Array.isArray(parsedData) ? parsedData : []);
          } catch {
            setDeliveryTimes([]);
          }
        } else {
          setDeliveryTimes([]);
        }
      }
      setIsLoadingDeliveryTimes(false);

      // Get free shipping settings from siteSettings
      if (siteSettings.freeShipping !== undefined) {
        setFreeShippingEnabled(siteSettings.freeShipping === true || siteSettings.freeShipping === "true");
      }
      if (siteSettings.freeShippingAmount !== undefined) {
        setFreeShippingAmount(parseFloat(siteSettings.freeShippingAmount) || 0);
      }
      if (siteSettings.minimumOrderAmount !== undefined) {
        setMinimumOrderAmount(parseFloat(siteSettings.minimumOrderAmount) || 0);
      }

      // Get shippingClass ID and fetch shipping data from API
      const shippingClassId = siteSettings.shippingClass?.id || siteSettings.shippingClass;
      if (shippingClassId) {
        try {
          const shippingRes = await fetchApi({
            url: `shipping/read/${shippingClassId}`,
            method: "GET",
          });
          if (shippingRes?.success === 1 && shippingRes.data) {
            setShippingClass(shippingRes.data);
            setShippingError(false);
          } else {
            setShippingError(true);
          }
        } catch (error) {
          console.error("Failed to fetch shipping data:", error);
          setShippingError(true);
        }
      } else {
        setShippingError(true);
      }

      // Get taxClass ID and fetch tax data from API
      const taxClassId = siteSettings.taxClass?.id || siteSettings.taxClass;
      if (taxClassId) {
        try {
          const taxRes = await fetchApi({
            url: `tax/read/${taxClassId}`,
            method: "GET",
          });
          if (taxRes?.success === 1 && taxRes.data) {
            setTaxClass(taxRes.data);
            setTaxError(false);
          } else {
            setTaxError(true);
          }
        } catch (error) {
          console.error("Failed to fetch tax data:", error);
          setTaxError(true);
        }
      } else {
        setTaxError(true);
      }

    } catch (error) {
      console.error("Failed to load settings:", error);
      setShippingError(true);
      setTaxError(true);
    } finally {
      setIsLoadingTaxShipping(false);
    }
  };

  // Handle redirect when cart is empty
  useEffect(() => {
    if (!cart || cart?.length === 0) {
      setShouldRedirect(true);
    }
  }, [cart]);

  // Perform redirect in useEffect
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/cart");
    }
  }, [shouldRedirect, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetchApi({
        url: `address/list?user=${user?.id || ""}&page=1&skip=0&limit=10`,
        method: "GET",
      });

      if (res?.success === 1) {
        setAddresses(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: "",
      city: "",
      zip: "",
      country: "Pakistan",
      phone: user?.phone_no || "",
      mobile_wallet_number: "",
      delivery_time: "",
      billing_address: {
        street: "",
        city: "",
        state: "Federal",
        postal_code: "",
        country: "Pakistan",
      },
    },
  });

  // Set default addresses when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultShipping = addresses.find(
        (addr) => addr.type === "shipping" && addr.is_default
      );
      const defaultBilling = addresses.find(
        (addr) => addr.type === "billing" && addr.is_default
      );

      if (defaultShipping) {
        setValue("name", user?.name || "");
        setValue("email", user?.email || "");
        setValue("address", defaultShipping.address.street);
        setValue("city", defaultShipping.address.city);
        setValue("zip", defaultShipping.address.postal_code || "");
        setValue("phone", user?.phone_no || "");
        setValue("country", defaultShipping.address.country || "Pakistan");
      }

      if (defaultBilling) {
        setValue("billing_address.street", defaultBilling.address.street);
        setValue("billing_address.city", defaultBilling.address.city);
        setValue(
          "billing_address.state",
          defaultBilling.address.state || "Federal"
        );
        setValue(
          "billing_address.postal_code",
          defaultBilling.address.postal_code || ""
        );
        setValue(
          "billing_address.country",
          defaultBilling.address.country || "Pakistan"
        );
      }
    }
  }, [addresses, user, setValue]);

  // Set first delivery time as default when delivery times are loaded
  useEffect(() => {
    if (deliveryTimes.length > 0) {
      const firstDeliveryTime = deliveryTimes[0];
      // Combine title + description for the value
      const displayValue = firstDeliveryTime.description
        ? `${firstDeliveryTime.title} - ${firstDeliveryTime.description}`
        : firstDeliveryTime.title;
      setValue("delivery_time", displayValue || `slot-0`);
    }
  }, [deliveryTimes, setValue]);

  // Auto-fill shipping address from billing address when checkbox is unchecked
  useEffect(() => {
    if (!shipToDifferentAddress) {
      const subscription = watch((value, { name, type }) => {
        // Only copy from billing to shipping when user types in billing fields
        if (name?.startsWith('billing_address.')) {
          setValue("address", value.billing_address?.street || "");
          setValue("city", value.billing_address?.city || "");
          setValue("zip", value.billing_address?.postal_code || "");
          setValue("country", value.billing_address?.country || "Pakistan");
        }
      });

      // Initial copy when checkbox is unchecked
      const billingStreet = watch("billing_address.street");
      const billingCity = watch("billing_address.city");
      const billingPostalCode = watch("billing_address.postal_code");
      const billingCountry = watch("billing_address.country");

      setValue("address", billingStreet);
      setValue("city", billingCity);
      setValue("zip", billingPostalCode);
      setValue("country", billingCountry);

      return () => subscription.unsubscribe();
    }
  }, [shipToDifferentAddress, watch, setValue]);

  // Calculate subtotal using ACTUAL/REGULAR prices (before any discounts)
  const subtotal = useMemo(
    () =>
      cart?.reduce((acc, item) => {
        // For variable products, get variation regular price
        if (item.variation_option_id && item.product.variation_options) {
          const variation = item.product.variation_options.find(
            (v: any) => v.id === item.variation_option_id
          );
          if (variation?.price) {
            return acc + parseFloat(variation.price) * item.quantity;
          }
        }
        // For simple products, use regular price
        return acc + (item.product.price || 0) * item.quantity;
      }, 0) || 0,
    [cart]
  );

  // Calculate product discount (when sale_price exists and is lower than regular price)
  const productDiscount = useMemo(() => {
    return (
      cart?.reduce((acc, item) => {
        let regularPrice = item.product.price || 0;
        let salePrice = 0;

        // For variable products, check variation prices
        if (item.variation_option_id && item.product.variation_options) {
          const variation = item.product.variation_options.find(
            (v: any) => v.id === item.variation_option_id
          );
          if (variation) {
            regularPrice = parseFloat(variation.price) || 0;
            salePrice = parseFloat(variation.sale_price || "0") || 0;
          }
        } else {
          // For simple products
          salePrice = item.product.sale_price || 0;
        }

        if (salePrice > 0 && regularPrice > salePrice) {
          return acc + (regularPrice - salePrice) * item.quantity;
        }
        return acc;
      }, 0) || 0
    );
  }, [cart]);

  // Calculate base shipping cost (before free shipping discount)
  const baseShippingCost = useMemo(() => {
    if (!shippingClass) return 0;

    const shippingAmount = parseFloat(shippingClass.amount) || 0;

    if (shippingClass.type === "fixed") {
      return shippingAmount;
    } else if (shippingClass.type === "percentage") {
      return (subtotal * shippingAmount) / 100;
    } else if (shippingClass.type === "free_shipping") {
      return 0;
    }
    return 0;
  }, [shippingClass, subtotal]);

  // Calculate the order total for free shipping eligibility (product amount - product discount)
  const orderTotalForFreeShipping = useMemo(() => {
    return subtotal - productDiscount;
  }, [subtotal, productDiscount]);

  // Check if free shipping discount is applicable
  const isFreeShippingApplicable = useMemo(() => {
    return freeShippingEnabled && orderTotalForFreeShipping >= minimumOrderAmount;
  }, [freeShippingEnabled, orderTotalForFreeShipping, minimumOrderAmount]);

  // Calculate the free shipping discount amount
  const freeShippingDiscount = useMemo(() => {
    if (!isFreeShippingApplicable) return 0;
    // If freeShippingAmount >= baseShippingCost, discount = full shipping (shipping becomes 0)
    // If freeShippingAmount < baseShippingCost, discount = freeShippingAmount
    return Math.min(freeShippingAmount, baseShippingCost);
  }, [isFreeShippingApplicable, freeShippingAmount, baseShippingCost]);

  // Calculate final shipping cost (after free shipping discount)
  const shippingCost = useMemo(() => {
    return baseShippingCost - freeShippingDiscount;
  }, [baseShippingCost, freeShippingDiscount]);

  // Calculate coupon discount with minimum cart amount validation
  // ✅ IMPORTANT: Coupon is applied BEFORE tax calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    // Check minimum cart amount requirement
    const minCartAmount = parseFloat(appliedCoupon.minimum_cart_amount) || 0;
    const discountableAmount = subtotal - productDiscount;

    if (minCartAmount > 0 && subtotal < minCartAmount) {
      return 0; // Coupon not applicable if cart doesn't meet minimum amount
    }

    const couponAmount = parseFloat(appliedCoupon.amount) || 0;

    // Handle free_shipping type: add shipping cost to discount
    if (appliedCoupon.type === "free_shipping") {
      return shippingCost; // Discount equals shipping cost
    } else if (appliedCoupon.type === "fixed") {
      return Math.min(couponAmount, discountableAmount);
    } else if (appliedCoupon.type === "percentage") {
      return (discountableAmount * couponAmount) / 100;
    }
    return 0;
  }, [appliedCoupon, subtotal, productDiscount, shippingCost]);

  // Calculate tax amount
  // ✅ IMPORTANT: Tax is calculated AFTER coupon discount
  const taxAmount = useMemo(() => {
    if (!taxClass) return 0;

    const taxRate = parseFloat(taxClass.rate) || 0;
    // Tax is applied on: subtotal - product discount - coupon discount
    const taxableAmount = subtotal - productDiscount - couponDiscount;
    return (taxableAmount * taxRate) / 100;
  }, [taxClass, subtotal, productDiscount, couponDiscount]);

  // Check if coupon meets minimum cart amount requirement
  const isCouponApplicable = useMemo(() => {
    if (!appliedCoupon) return true;

    const minCartAmount = parseFloat(appliedCoupon.minimum_cart_amount) || 0;
    return minCartAmount === 0 || subtotal >= minCartAmount;
  }, [appliedCoupon, subtotal]);

  // Calculate final total (order total before wallet deduction)
  const finalTotal = useMemo(() => {
    return (
      subtotal - productDiscount - couponDiscount + shippingCost + taxAmount
    );
  }, [subtotal, productDiscount, couponDiscount, shippingCost, taxAmount]);

  // Calculate wallet amount to use (minimum of wallet balance and order total)
  const walletAmountToUse = useMemo(() => {
    if (!useWallet || walletBalance <= 0) return 0;
    return Math.min(walletBalance, finalTotal);
  }, [useWallet, walletBalance, finalTotal]);

  // Calculate remaining wallet balance after this order
  const remainingWalletBalance = useMemo(() => {
    if (!useWallet) return walletBalance;
    return Math.max(0, walletBalance - finalTotal);
  }, [useWallet, walletBalance, finalTotal]);

  // Calculate paid total (amount to pay after wallet deduction)
  const paidTotal = useMemo(() => {
    if (!useWallet) return finalTotal;
    return Math.max(0, finalTotal - walletAmountToUse);
  }, [useWallet, finalTotal, walletAmountToUse]);

  const totalItems = useMemo(() => cart?.length || 0, [cart]);

  // Get shipping display information
  const getShippingInfo = () => {
    if (!shippingClass) {
      return { text: "Calculating...", amount: 0, isFree: false, baseAmount: 0, discount: 0 };
    }

    // If shipping type is free_shipping, shipping is completely free
    if (shippingClass.type === "free_shipping") {
      return { text: "Free Shipping", amount: 0, isFree: true, baseAmount: 0, discount: 0 };
    }

    // Check if free shipping discount makes shipping completely free
    const isFreeAfterDiscount = shippingCost === 0 && baseShippingCost > 0 && isFreeShippingApplicable;

    if (shippingClass.type === "fixed") {
      return {
        text: `Shipping: ${shippingClass.name}`,
        amount: shippingCost,
        isFree: isFreeAfterDiscount,
        baseAmount: baseShippingCost,
        discount: freeShippingDiscount,
      };
    } else if (shippingClass.type === "percentage") {
      return {
        text: `Shipping: ${shippingClass.name} (${shippingClass.amount}%)`,
        amount: shippingCost,
        isFree: isFreeAfterDiscount,
        baseAmount: baseShippingCost,
        discount: freeShippingDiscount,
      };
    }

    return { text: "Standard Shipping", amount: 0, isFree: false, baseAmount: 0, discount: 0 };
  };

  const shippingInfo = getShippingInfo();

  // Apply coupon function with minimum cart amount validation
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await fetchApi({
        url: `coupon/redeem/${couponCode}`,
        method: "GET",
      });

      if (res?.success === 1 && res.data) {
        const coupon = res.data;
        const minCartAmount = parseFloat(coupon.minimum_cart_amount) || 0;

        // Check minimum cart amount requirement
        if (minCartAmount > 0 && subtotal < minCartAmount) {
          toast.error(
            `Minimum cart amount of ${currencyFormatter(
              minCartAmount
            )} required for this coupon`
          );
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
          toast.success("Coupon applied successfully!");
        }
      } else {
        toast.error(res?.detail || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      toast.error("Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove coupon function
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Helper function to create order after successful payment
  const createOrderAfterPayment = async (orderData: any, paymentId?: string, paymentResponse?: any) => {
    setIsCreatingOrder(true);
    setServerError(null);

    try {
      const orderDataWithPayment = {
        ...orderData,
        payment_status: paymentId ? "success" : "cash-on-delivery",
        payment_id: paymentId || null,
        payment_response: paymentResponse || null, // Include full payment response
      };

      const res = await fetchApi({
        url: "order/cartcreate",
        method: "POST",
        data: orderDataWithPayment,
      });

      // Handle successful order creation (success: 1 or success: true)
      if (res?.success === 1 || res?.success === true) {
        // Order created successfully - clear everything and redirect
        const trackingNumber = res.data?.tracking_number;
        setPaymentCompleted(false);
        setCompletedPaymentData(null);
        setIsCreatingOrder(false);
        await clear();
        if (trackingNumber) {
          router.push(`/order-success?tracking=${trackingNumber}`);
        } else {
          toast.success("Order placed successfully!");
          router.push("/");
        }
        return { success: true };
      } else {
        // Order creation failed - parse error response properly
        setIsCreatingOrder(false);
        if (paymentId) {
          // Save payment data so user can retry without re-paying
          setPaymentCompleted(true);
          setCompletedPaymentData({
            paymentId,
            paymentResponse,
            orderData,
          });
        }

        // Parse error message from response
        let errorMessage = "Failed to create order. Please try again.";
        if (res?.detail) {
          errorMessage = res.detail;
        } else if (res?.message) {
          errorMessage = res.message;
        } else if (res?.error && typeof res.error === 'string') {
          errorMessage = res.error;
        } else if (res?.data?.detail) {
          errorMessage = res.data.detail;
        } else if (res?.data?.message) {
          errorMessage = res.data.message;
        } else if (res?.status && res?.statusText) {
          errorMessage = `Server error (${res.status}): ${res.statusText}`;
        }

        setServerError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error("Order creation error:", err);
      setIsCreatingOrder(false);
      // Save payment data for retry on network error
      if (paymentId) {
        setPaymentCompleted(true);
        setCompletedPaymentData({
          paymentId,
          paymentResponse,
          orderData,
        });
      }
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to create order. Please check your connection and try again.";
      setServerError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle OTP verification for EasyPaisa/JazzCash
  const handleOTPVerify = async (otp: string) => {
    if (!pendingOrderData) return;

    let result;
    if (otpPaymentMethod === 'easypaisa') {
      result = await verifyEasyPaisaOTP(otp);
    } else {
      result = await verifyJazzCashOTP(otp);
    }

    if (result.success) {
      setShowOTPModal(false);
      toast.success("Payment successful!");

      // Build payment response object
      const paymentResponse = {
        gateway: otpPaymentMethod,
        transactionId: result.transactionId,
        transactionStatus: result.transactionStatus,
        message: result.message,
        responseCode: 'responseCode' in result ? result.responseCode : undefined,
        errorCode: 'errorCode' in result ? result.errorCode : undefined,
        verifiedAt: new Date().toISOString(),
      };

      // Create order with payment ID and full payment response
      await createOrderAfterPayment(pendingOrderData, result.transactionId || 'verified', paymentResponse);
      setPendingOrderData(null);
      resetEasyPaisaState();
      resetJazzCashState();
    }
    // Error is already shown by the modal via the hook's error state
  };

  // Handle OTP modal close
  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    setPendingOrderData(null);
    resetEasyPaisaState();
    resetJazzCashState();
    setServerError("Payment was cancelled. Please try again.");
  };

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    const billingAddress = values.billing_address;
    setServerError(null);

    // ========== RETRY ORDER CREATION (Payment already completed) ==========
    // If payment was already successful but order creation failed, just retry order creation
    if (paymentCompleted && completedPaymentData) {
      console.log("Retrying order creation with existing payment data...");
      await createOrderAfterPayment(
        completedPaymentData.orderData,
        completedPaymentData.paymentId,
        completedPaymentData.paymentResponse
      );
      return;
    }

    // Validate required billing fields
    if (!billingAddress.street || !billingAddress.city) {
      setServerError(
        "Please fill in all required billing address fields (Street and City)."
      );
      return;
    }

    // Validate delivery time is selected
    if (!values.delivery_time) {
      setServerError("Please select a delivery time slot");
      return;
    }

    // Validate mobile wallet number for EasyPaisa/JazzCash
    if (selectedPayment === "easypaisa" || selectedPayment === "jazzcash") {
      const walletNumber = values.mobile_wallet_number || mobileWalletNumber;
      if (!walletNumber || !/^03[0-9]{9}$/.test(walletNumber.replace(/[^0-9]/g, ''))) {
        setServerError("Please enter a valid mobile wallet number (03XXXXXXXXX) for payment.");
        return;
      }
    }

    // Format delivery_time as: "Selected Date + Time Slot"
    const formattedDate = format(selectedDeliveryDate, "EEEE, MMMM d, yyyy");
    const formattedDeliveryTime = `${formattedDate} - ${values.delivery_time}`;

    const orderData = {
      shipping_address: shipToDifferentAddress
        ? {
            name: values.name,
            email: values.email,
            phone: values.phone,
            street: values.address,
            city: values.city,
            state: "Federal",
            postal_code: values.zip,
            country: values.country,
            is_default: shippingIsDefault,
          }
        : {
            name: values.name,
            email: values.email,
            phone: values.phone,
            street: billingAddress.street,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.postal_code,
            country: billingAddress.country,
            is_default: billingIsDefault,
          },
      billing_address: {
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        postal_code: billingAddress.postal_code,
        country: billingAddress.country,
        is_default: billingIsDefault,
      },
      payment_gateway: selectedPayment,
      cart: cart?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product.id,
        variation_option_id: item.variation_option_id || null,
      })),
      // Required fields for backend calculation
      shipping_id: typeof shippingClass === 'object' ? shippingClass?.id : shippingClass,
      tax_id: typeof taxClass === 'object' ? taxClass?.id : taxClass,
      coupon_id: appliedCoupon?.id || null,
      customer_contact: values.phone,
      customer_id: user?.id || null,
      delivery_time: formattedDeliveryTime,
      use_wallet: useWallet && walletAmountToUse > 0,
      wallet_amount: useWallet ? walletAmountToUse : 0,
    };

    console.log("Submitting order with payment method:", selectedPayment);

    try {
      // ========== CASH ON DELIVERY ==========
      // Create order directly without payment
      if (selectedPayment === "cash_on_delivery") {
        await createOrderAfterPayment(orderData);
        return;
      }

      // ========== PAYFAST ==========
      // For redirect flow: Create order FIRST, then redirect to PayFast
      if (selectedPayment === "payfast") {
        setIsCreatingOrder(true);

        try {
          // Generate order ID for PayFast
          const tempOrderId = `PF${Date.now()}`;

          // Build payment response object for PayFast (pending status)
          const paymentResponse = {
            gateway: 'payfast',
            transactionId: tempOrderId,
            transactionStatus: 'PENDING',
            message: 'Awaiting PayFast payment',
            completedAt: new Date().toISOString(),
          };

          // Create order FIRST (without redirect) to get tracking number
          const orderDataWithPayment = {
            ...orderData,
            payment_status: "pending",
            payment_id: tempOrderId,
            payment_response: paymentResponse,
          };

          const res = await fetchApi({
            url: "order/cartcreate",
            method: "POST",
            data: orderDataWithPayment,
          });

          if (res?.success === 1 || res?.success === true) {
            const trackingNumber = res.data?.tracking_number;

            // Clear cart since order is created
            await clear();

            setIsCreatingOrder(false);

            // Now initiate PayFast redirect with tracking number
            const paymentResult = await initiatePayFastPayment({
              orderId: tempOrderId,
              amount: paidTotal,
              itemName: `Order Payment`,
              itemDescription: `${cart?.length} item(s)`,
              customerEmail: values.email,
              customerFirstName: values.name.split(' ')[0],
              customerLastName: values.name.split(' ').slice(1).join(' ') || values.name.split(' ')[0],
              customerPhone: values.phone,
              trackingNumber: trackingNumber, // Pass tracking number for return URL
            });

            // If we reach here, redirect failed
            if (!paymentResult.success) {
              setServerError(paymentResult.message || "Payment was not completed. Please try again.");
            }
          } else {
            setIsCreatingOrder(false);
            const errorMessage = res?.detail || res?.message || "Failed to create order";
            setServerError(errorMessage);
          }
        } catch (err) {
          setIsCreatingOrder(false);
          const errorMessage = err instanceof Error ? err.message : "Failed to create order";
          setServerError(errorMessage);
        }
        return;
      }

      // ========== EASYPAISA ==========
      // Initiate payment, show OTP modal, create order on success
      if (selectedPayment === "easypaisa") {
        const walletNumber = values.mobile_wallet_number || mobileWalletNumber;
        setMobileWalletNumber(walletNumber);

        const paymentResult = await initiateEasyPaisaPayment({
          orderId: `EP${Date.now()}`,
          amount: paidTotal,
          mobileNumber: walletNumber,
          customerEmail: values.email,
          customerName: values.name,
        });

        if (paymentResult.success) {
          // Payment initiated, show OTP modal
          setPendingOrderData(orderData);
          setOtpPaymentMethod('easypaisa');
          setShowOTPModal(true);
        } else {
          // Payment initiation failed
          setServerError(paymentResult.error || "Failed to initiate payment. Please try again.");
        }
        return;
      }

      // ========== JAZZCASH ==========
      // Initiate payment, show OTP modal, create order on success
      if (selectedPayment === "jazzcash") {
        const walletNumber = values.mobile_wallet_number || mobileWalletNumber;
        setMobileWalletNumber(walletNumber);

        const paymentResult = await initiateJazzCashPayment({
          orderId: `JC${Date.now()}`,
          amount: paidTotal,
          mobileNumber: walletNumber,
          customerEmail: values.email,
          customerName: values.name,
          description: `Order Payment - ${cart?.length} item(s)`,
        });

        if (paymentResult.success) {
          // Payment initiated, show OTP modal
          setPendingOrderData(orderData);
          setOtpPaymentMethod('jazzcash');
          setShowOTPModal(true);
        } else {
          // Payment initiation failed
          setServerError(paymentResult.error || "Failed to initiate payment. Please try again.");
        }
        return;
      }

    } catch (err) {
      console.error("Payment/Order error:", err);
      setServerError("An error occurred. Please try again.");
    }
  };

  // Show loading state while checking for redirect
  if (shouldRedirect) {
    return (
      <Screen>
        <div className="flex justify-center items-center min-h-64">
          <p>Redirecting to cart...</p>
        </div>
      </Screen>
    );
  }

  // Check if any payment is processing
  const isAnyPaymentProcessing = isPayFastProcessing || isEasyPaisaProcessing || isJazzCashProcessing;

  return (
    <Screen>
      {/* Payment Processing Overlay */}
      {isAnyPaymentProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600">
              {isPayFastProcessing && (
                <>
                  Please complete the payment in the PayFast popup window.
                  <br />
                  Do not close this page.
                </>
              )}
              {isEasyPaisaProcessing && "Processing your EasyPaisa payment..."}
              {isJazzCashProcessing && "Processing your JazzCash payment..."}
            </p>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        onVerify={handleOTPVerify}
        isLoading={isEasyPaisaProcessing || isJazzCashProcessing}
        error={otpPaymentMethod === 'easypaisa' ? easyPaisaError : jazzCashError}
        paymentMethod={otpPaymentMethod}
        mobileNumber={mobileWalletNumber}
      />

      <main className="mt-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
              <p className="text-muted-foreground">Complete your purchase</p>

              {!isAuth && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="guest-checkout"
                    checked={checkoutAsGuest}
                    onCheckedChange={(checked) =>
                      setCheckoutAsGuest(checked as boolean)
                    }
                  />
                  <Label htmlFor="guest-checkout">Checkout as guest</Label>
                </div>
              )}
              {!isAuth && (
                <>
                  <Separator />
                  <p className="italic text-xs text-center text-muted-foreground">
                    Offline Order
                  </p>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Shipping Information Banner */}
              <div className={`border rounded-lg p-4 ${shippingInfo.isFree || shippingInfo.discount > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${shippingInfo.isFree || shippingInfo.discount > 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                      <svg
                        className={`w-5 h-5 ${shippingInfo.isFree || shippingInfo.discount > 0 ? 'text-green-600' : 'text-blue-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${shippingInfo.isFree || shippingInfo.discount > 0 ? 'text-green-900' : 'text-blue-900'}`}>
                        {shippingInfo.isFree
                          ? "Free Shipping!"
                          : shippingInfo.discount > 0
                          ? "Shipping Discount Applied!"
                          : "Shipping Information"}
                      </h3>
                      <p className={`text-sm ${shippingInfo.isFree || shippingInfo.discount > 0 ? 'text-green-700' : 'text-blue-700'}`}>
                        {shippingInfo.isFree
                          ? "Your order qualifies for free shipping!"
                          : shippingInfo.discount > 0
                          ? `${shippingInfo.text} - ${currencyFormatter(shippingInfo.amount)} (You save ${currencyFormatter(shippingInfo.discount)})`
                          : `${shippingInfo.text} - ${currencyFormatter(shippingInfo.amount)}`}
                      </p>
                      {/* Show minimum order info if not eligible for free shipping */}
                      {freeShippingEnabled && !isFreeShippingApplicable && minimumOrderAmount > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Add {currencyFormatter(minimumOrderAmount - orderTotalForFreeShipping)} more to get free shipping discount!
                        </p>
                      )}
                    </div>
                  </div>
                  {shippingInfo.isFree && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      FREE
                    </span>
                  )}
                  {shippingInfo.discount > 0 && !shippingInfo.isFree && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      DISCOUNT
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter your name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter your email"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Phone *
                    </label>
                    <input
                      type="text"
                      {...register("phone")}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter your phone number"
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Billing Information *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      {...register("billing_address.street")}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter street address"
                      required
                    />
                    {errors.billing_address?.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.billing_address.street.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register("billing_address.city")}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter city"
                      required
                    />
                    {errors.billing_address?.city && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.billing_address.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      {...register("billing_address.postal_code")}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      {...register("billing_address.country")}
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      defaultValue="Pakistan"
                      readOnly
                    />
                  </div>
                  {isAuth && (
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <Checkbox
                        id="billing-default"
                        checked={billingIsDefault}
                        onCheckedChange={(checked) =>
                          setBillingIsDefault(checked as boolean)
                        }
                      />
                      <Label htmlFor="billing-default" className="text-sm">
                        Save as default billing address
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Ship to different address */}
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="different-address"
                    checked={shipToDifferentAddress}
                    onCheckedChange={(checked) =>
                      setShipToDifferentAddress(checked as boolean)
                    }
                  />
                  <Label htmlFor="different-address" className="text-sm">
                    Ship to a different address?
                  </Label>
                </div>

                {/* Show shipping address errors only when "ship to different address" is NOT checked */}
                {!shipToDifferentAddress && (errors.address || errors.city) && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {errors.address && <p>{errors.address.message}</p>}
                    {errors.city && <p>{errors.city.message}</p>}
                  </div>
                )}
              </div>

              {/* Shipping Information (conditional) */}
              {shipToDifferentAddress && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Shipping Street Address *
                      </label>
                      <input
                        type="text"
                        {...register("address")}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Enter shipping street address"
                        required
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shipping City *
                      </label>
                      <input
                        type="text"
                        {...register("city")}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Enter shipping city"
                        required
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shipping Postal Code
                      </label>
                      <input
                        type="text"
                        {...register("zip")}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Enter shipping postal code"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        {...register("country")}
                        className="w-full border rounded px-3 py-2 bg-gray-100"
                        defaultValue="Pakistan"
                        readOnly
                      />
                    </div>
                    {isAuth && (
                      <div className="md:col-span-2 flex items-center space-x-2">
                        <Checkbox
                          id="shipping-default"
                          checked={shippingIsDefault}
                          onCheckedChange={(checked) =>
                            setShippingIsDefault(checked as boolean)
                          }
                        />
                        <Label htmlFor="shipping-default" className="text-sm">
                          Save as default shipping address
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Date and Time Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery Date & Time *</h3>
                <div className="space-y-4">
                  {/* Date Picker */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Select Delivery Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDeliveryDate, "EEEE, MMMM d, yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDeliveryDate}
                          onSelect={(date) => date && setSelectedDeliveryDate(date)}
                          disabled={(date) => {
                            // Disable past dates and today
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date <= today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Show selected delivery date info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Delivery Date: {format(selectedDeliveryDate, "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      Select Delivery Time Slot
                    </Label>
                    {isLoadingDeliveryTimes ? (
                      <div className="text-center py-4">
                        <p>Loading delivery times...</p>
                      </div>
                    ) : deliveryTimes.length > 0 ? (
                      <Select
                        value={watch("delivery_time")}
                        onValueChange={(value) =>
                          setValue("delivery_time", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a delivery time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryTimes.map((timeSlot, index) => {
                            // Combine title + description for the value
                            const displayValue = timeSlot.description
                              ? `${timeSlot.title} - ${timeSlot.description}`
                              : timeSlot.title;
                            return (
                              <SelectItem
                                key={index}
                                value={displayValue || `slot-${index}`}
                              >
                                {displayValue}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No delivery times available</p>
                      </div>
                    )}
                    {errors.delivery_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.delivery_time.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                {mounted ? totalItems : 0} item{(mounted ? totalItems : 0) !== 1 ? "s" : ""} in cart
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingTaxShipping && (
                <div className="text-center py-4">
                  <p>Loading shipping and tax information...</p>
                </div>
              )}

              {mounted && cart?.map((item, index) => {
                const {
                  product: { name, image, id },
                  quantity,
                } = item || {};

                let regularPrice = item.product.price || 0;
                let salePrice = 0;
                let hasDiscount = false;

                // For variable products, check variation prices
                if (item.variation_option_id && item.product.variation_options) {
                  const variation = item.product.variation_options.find(
                    (v: any) => v.id === item.variation_option_id
                  );
                  if (variation) {
                    regularPrice = parseFloat(variation.price) || 0;
                    salePrice = parseFloat(variation.sale_price || "0") || 0;
                    hasDiscount = salePrice > 0 && regularPrice > salePrice;
                  }
                } else {
                  // For simple products
                  salePrice = item.product.sale_price || 0;
                  hasDiscount = salePrice > 0 && regularPrice > salePrice;
                }

                const effectivePrice = hasDiscount ? salePrice : regularPrice;
                const itemSubtotal = effectivePrice * quantity;
                const regularSubtotal = regularPrice * quantity;
                const variationText = getVariationDisplayText(item);

                return (
                  <div
                    key={`${id}-${index}`}
                    className="flex gap-2 items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Image
                        src={image?.original || "/placeholder-image.jpg"}
                        alt={name}
                        className="object-contain h-10 w-10 rounded-lg"
                        width={40}
                        height={40}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{name}</span>
                        {variationText && (
                          <div className="text-xs text-muted-foreground">
                            {variationText}
                          </div>
                        )}
                        <div className="text-xs">
                          {hasDiscount ? (
                            <div className="flex flex-col">
                              <span className="text-muted-foreground line-through">
                                {currencyFormatter(regularPrice)} x {quantity}
                              </span>
                              <span className="text-green-600 font-medium">
                                {currencyFormatter(effectivePrice)} x {quantity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {currencyFormatter(effectivePrice)} x {quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {hasDiscount && (
                        <div className="text-xs text-muted-foreground line-through">
                          {currencyFormatter(regularSubtotal)}
                        </div>
                      )}
                      <span className={`text-sm font-medium whitespace-nowrap ${hasDiscount ? 'text-green-600' : ''}`}>
                        {currencyFormatter(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <Separator />

              {/* Shipping Information Display */}
              <div className={`rounded-lg p-3 ${shippingError ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg
                      className={`w-4 h-4 ${shippingError ? 'text-red-600' : 'text-gray-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium">Shipping</span>
                  </div>
                  <div className="text-right">
                    {isLoadingTaxShipping ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : shippingError ? (
                      <div className="text-sm text-red-500">Error loading</div>
                    ) : (
                      <>
                        {/* Show original price struck through if there's a discount */}
                        {shippingInfo.discount > 0 && (
                          <div className="text-xs text-muted-foreground line-through">
                            {currencyFormatter(shippingInfo.baseAmount)}
                          </div>
                        )}
                        <div
                          className={`text-sm font-semibold ${
                            shippingInfo.isFree || shippingInfo.discount > 0 ? "text-green-600" : ""
                          }`}
                        >
                          {shippingInfo.isFree
                            ? "FREE"
                            : currencyFormatter(shippingInfo.amount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {shippingInfo.text}
                        </div>
                        {shippingInfo.discount > 0 && !shippingInfo.isFree && (
                          <div className="text-xs text-green-600 mt-1">
                            Saved {currencyFormatter(shippingInfo.discount)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Apply Coupon</h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon || isApplyingCoupon}
                    className="flex-1"
                  />
                  {appliedCoupon ? (
                    <Button
                      onClick={removeCoupon}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="whitespace-nowrap"
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <div
                    className={`border rounded p-3 text-sm ${
                      isCouponApplicable
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-yellow-50 border-yellow-200 text-yellow-700"
                    }`}
                  >
                    <div className="font-medium">
                      Coupon "{appliedCoupon.code}"{" "}
                      {isCouponApplicable
                        ? "applied successfully!"
                        : "requirements not met"}
                    </div>
                    {appliedCoupon.type === "fixed" && (
                      <div>
                        Discount: {currencyFormatter(appliedCoupon.amount)}
                      </div>
                    )}
                    {appliedCoupon.type === "percentage" && (
                      <div>Discount: {appliedCoupon.amount}%</div>
                    )}
                    {appliedCoupon.type === "free_shipping" && (
                      <div>
                        Benefit: Free Shipping (Save {currencyFormatter(shippingCost)})
                      </div>
                    )}
                    {appliedCoupon.minimum_cart_amount > 0 && (
                      <div
                        className={`text-xs mt-1 ${
                          isCouponApplicable
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Minimum cart amount:{" "}
                        {currencyFormatter(appliedCoupon.minimum_cart_amount)}
                        {!isCouponApplicable && (
                          <span className="block font-medium">
                            Add{" "}
                            {currencyFormatter(
                              appliedCoupon.minimum_cart_amount - subtotal
                            )}{" "}
                            more to use this coupon
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Summary Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Actual Price</span>
                  <span>{currencyFormatter(subtotal)}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{currencyFormatter(productDiscount)}</span>
                  </div>
                )}

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-{currencyFormatter(couponDiscount)}</span>
                  </div>
                )}

                {appliedCoupon && !isCouponApplicable && (
                  <div className="flex items-center justify-between text-yellow-600 text-sm">
                    <span>Coupon not applicable</span>
                    <span className="text-xs">
                      Min.{" "}
                      {currencyFormatter(appliedCoupon.minimum_cart_amount)}{" "}
                      required
                    </span>
                  </div>
                )}

                {/* Tax Section */}
                {isLoadingTaxShipping ? (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>Loading...</span>
                  </div>
                ) : taxError ? (
                  <div className="flex items-center justify-between text-red-500">
                    <span>Tax</span>
                    <span>Error loading</span>
                  </div>
                ) : taxClass && taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>
                      Tax{" "}
                      {taxClass?.name &&
                        `(${taxClass.name} - ${taxClass.rate}%)`}
                    </span>
                    <span>{currencyFormatter(taxAmount)}</span>
                  </div>
                )}

                {/* Shipping Section */}
                {isLoadingTaxShipping ? (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Loading...</span>
                  </div>
                ) : shippingError ? (
                  <div className="flex items-center justify-between text-red-500">
                    <span>Shipping</span>
                    <span>Error loading</span>
                  </div>
                ) : (
                  <>
                    {/* Shipping with base cost and discount display */}
                    {baseShippingCost > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Shipping</span>
                        <span
                          className={
                            (appliedCoupon?.type === "free_shipping" || freeShippingDiscount > 0)
                              ? "line-through text-gray-400"
                              : ""
                          }
                        >
                          {currencyFormatter(baseShippingCost)}
                        </span>
                      </div>
                    )}

                    {/* Show free shipping discount from siteSettings */}
                    {freeShippingDiscount > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>Free Shipping Discount</span>
                        <span>-{currencyFormatter(freeShippingDiscount)}</span>
                      </div>
                    )}

                    {/* Show remaining shipping cost after discount if partial */}
                    {freeShippingDiscount > 0 && shippingCost > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Remaining Shipping</span>
                        <span>{currencyFormatter(shippingCost)}</span>
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Wallet Section - Only show for logged in users with wallet balance */}
              {isAuth && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Use Wallet Balance</h3>
                    {isLoadingWallet ? (
                      <div className="text-sm text-muted-foreground">Loading wallet...</div>
                    ) : walletBalance > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="use-wallet"
                            checked={useWallet}
                            onCheckedChange={(checked) => setUseWallet(checked as boolean)}
                          />
                          <Label htmlFor="use-wallet" className="text-sm cursor-pointer">
                            Use wallet balance ({currencyFormatter(walletBalance)} available)
                          </Label>
                        </div>

                        {useWallet && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-700">Wallet amount to use:</span>
                              <span className="font-semibold text-green-700">
                                -{currencyFormatter(walletAmountToUse)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Remaining wallet balance:</span>
                              <span className="font-medium text-gray-700">
                                {currencyFormatter(remainingWalletBalance)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No wallet balance available
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Order Total (before wallet) */}
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Order Total</span>
                <span>{currencyFormatter(finalTotal)}</span>
              </div>

              {/* Show wallet deduction and paid total when wallet is used */}
              {useWallet && walletAmountToUse > 0 && (
                <>
                  <div className="flex items-center justify-between text-green-600">
                    <span>Wallet Deduction</span>
                    <span>-{currencyFormatter(walletAmountToUse)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-bold text-lg text-primary">
                    <span>Amount to Pay</span>
                    <span>{currencyFormatter(paidTotal)}</span>
                  </div>
                </>
              )}

              {/* Payment Options */}
              <div className="payment">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="payment_option space-y-3">
                  <div className="custome-radio flex items-center space-x-2">
                    <input
                      className="form-check-input"
                      required
                      type="radio"
                      name="payment_option"
                      id="payfast"
                      checked={selectedPayment === "payfast"}
                      onChange={() => setSelectedPayment("payfast")}
                      disabled={!isPayFastLoaded}
                    />
                    <label
                      className="form-check-label flex items-center"
                      htmlFor="payfast"
                    >
                      <img
                        src="/assets/imgs/payfast-logo.svg"
                        className="mr-2 h-5 w-auto"
                        alt="PayFast"
                      />
                      Pay with Card
                      {!isPayFastLoaded && (
                        <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                      )}
                    </label>
                  </div>
                  <div className="custome-radio flex items-center space-x-2">
                    <input
                      className="form-check-input"
                      required
                      type="radio"
                      name="payment_option"
                      id="easypaisa"
                      checked={selectedPayment === "easypaisa"}
                      onChange={() => setSelectedPayment("easypaisa")}
                    />
                    <label
                      className="form-check-label flex items-center"
                      htmlFor="easypaisa"
                    >
                      <img
                        src="/assets/imgs/easypaisa.png"
                        className="mr-2 w-6 h-6"
                        alt=""
                      />
                      Easy Paisa
                    </label>
                  </div>
                  <div className="custome-radio flex items-center space-x-2">
                    <input
                      className="form-check-input"
                      required
                      type="radio"
                      name="payment_option"
                      id="jazzcash"
                      checked={selectedPayment === "jazzcash"}
                      onChange={() => setSelectedPayment("jazzcash")}
                    />
                    <label
                      className="form-check-label flex items-center"
                      htmlFor="jazzcash"
                    >
                      <img
                        src="/assets/imgs/jazzcash.png"
                        className="mr-2 w-6 h-6"
                        alt=""
                      />
                      Jazz Cash
                    </label>
                  </div>
                  <div className="custome-radio flex items-center space-x-2">
                    <input
                      className="form-check-input"
                      required
                      type="radio"
                      name="payment_option"
                      id="cashOnDelivery"
                      checked={selectedPayment === "cash_on_delivery"}
                      onChange={() => setSelectedPayment("cash_on_delivery")}
                    />
                    <label
                      className="form-check-label flex items-center"
                      htmlFor="cashOnDelivery"
                    >
                      <img
                        src="/assets/imgs/cash-icon.png"
                        className="mr-2 w-6 h-6"
                        alt=""
                      />
                      Cash On Delivery
                    </label>
                  </div>
                </div>

                {/* Mobile Wallet Number Input for EasyPaisa/JazzCash */}
                {(selectedPayment === "easypaisa" || selectedPayment === "jazzcash") && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <Label htmlFor="mobile_wallet_number" className="block text-sm font-medium mb-2">
                      {selectedPayment === "easypaisa" ? "EasyPaisa" : "JazzCash"} Mobile Number *
                    </Label>
                    <Input
                      id="mobile_wallet_number"
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      {...register("mobile_wallet_number")}
                      onChange={(e) => setMobileWalletNumber(e.target.value)}
                      className="w-full"
                      maxLength={11}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your registered {selectedPayment === "easypaisa" ? "EasyPaisa" : "JazzCash"} mobile number. You will receive an OTP to confirm payment.
                    </p>
                  </div>
                )}
              </div>

              {/* Error message when APIs fail */}
              {(shippingError || taxError) && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-center">
                  <p className="text-sm text-red-700">
                    Unable to load {shippingError && "shipping"}{shippingError && taxError && " and "}{taxError && "tax"} information. Please refresh the page.
                  </p>
                </div>
              )}

              {/* Payment Success Notice - Show when payment done but order creation pending/failed */}
              {paymentCompleted && completedPaymentData && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Payment Successful!</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Your payment has been received. Click the button below to complete your order.
                  </p>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full mt-2"
                disabled={
                  isSubmitting ||
                  isAnyPaymentProcessing ||
                  isCreatingOrder ||
                  finalTotal <= 0 ||
                  isLoadingTaxShipping ||
                  isLoadingDeliveryTimes ||
                  shippingError ||
                  taxError ||
                  (selectedPayment === "payfast" && !isPayFastLoaded && !paymentCompleted)
                }
                size="lg"
                type="button"
              >
                {isCreatingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Order...
                  </span>
                ) : isSubmitting || isAnyPaymentProcessing ? (
                  "Processing Payment..."
                ) : isLoadingTaxShipping ? (
                  "Loading..."
                ) : paymentCompleted && completedPaymentData ? (
                  "Complete Order"
                ) : useWallet && walletAmountToUse > 0 ? (
                  `Place Order - ${currencyFormatter(paidTotal)}`
                ) : (
                  `Place Order - ${currencyFormatter(finalTotal)}`
                )}
              </Button>

              {/* Server Error Display - Below Place Order Button */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium">Order Failed</p>
                      <p className="text-sm mt-1">{serverError}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
