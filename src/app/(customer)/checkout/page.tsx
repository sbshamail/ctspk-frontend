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

// Create a complete checkout schema from scratch
const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().optional().default(""),
  country: z.string().optional().default("Pakistan"),
  phone: z.string().min(1, "Phone number is required"),
  delivery_time: z.string().min(1, "Delivery time is required"), // 🔴 NEW: Added delivery time field
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
  const { user } = auth || {};
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(!isAuth);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("cash_on_delivery");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // New state for tax, shipping, coupon, and delivery time
  const [taxClass, setTaxClass] = useState<any>(null);
  const [shippingClass, setShippingClass] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoadingTaxShipping, setIsLoadingTaxShipping] = useState(true);
  const [deliveryTimes, setDeliveryTimes] = useState<any[]>([]); // 🔴 NEW: Delivery times state
  const [isLoadingDeliveryTimes, setIsLoadingDeliveryTimes] = useState(true); // 🔴 NEW: Loading state for delivery times

  // Fetch addresses if user is authenticated
  useEffect(() => {
    if (isAuth && user?.id) {
      fetchAddresses();
    }
  }, [isAuth, user?.id]);

  // Fetch tax, shipping classes, and delivery times
  useEffect(() => {
    fetchTaxAndShippingClasses();
    fetchDeliveryTimes(); // 🔴 NEW: Fetch delivery times
  }, []);

  const fetchTaxAndShippingClasses = async () => {
    try {
      setIsLoadingTaxShipping(true);

      // Step 1: Get tax class ID from settings
      const taxIdRes = await fetchApi({
        url: "settings/value/taxClass?language=en",
        method: "GET",
      });

      // Step 2: Get shipping class ID from settings
      const shippingIdRes = await fetchApi({
        url: "settings/value/shippingClass?language=en",
        method: "GET",
      });

      let taxClassData = null;
      let shippingClassData = null;

      // Step 3: If tax ID exists, fetch the actual tax object
      if (taxIdRes?.success === 1 && taxIdRes.data) {
        const taxId = taxIdRes.data;
        try {
          const taxRes = await fetchApi({
            url: `tax/read/${taxId}`,
            method: "GET",
          });
          if (taxRes?.success === 1) {
            taxClassData = taxRes.data;
          }
        } catch (taxError) {
          console.error("Failed to fetch tax class details:", taxError);
        }
      }

      // Step 4: If shipping ID exists, fetch the actual shipping object
      if (shippingIdRes?.success === 1 && shippingIdRes.data) {
        const shippingId = shippingIdRes.data;
        try {
          const shippingRes = await fetchApi({
            url: `shipping/read/${shippingId}`,
            method: "GET",
          });
          if (shippingRes?.success === 1) {
            shippingClassData = shippingRes.data;
          }
        } catch (shippingError) {
          console.error(
            "Failed to fetch shipping class details:",
            shippingError
          );
        }
      }

      setTaxClass(taxClassData);
      setShippingClass(shippingClassData);
    } catch (error) {
      console.error("Failed to fetch tax/shipping classes:", error);
    } finally {
      setIsLoadingTaxShipping(false);
    }
  };

  // 🔴 NEW: Fetch delivery times from API
  const fetchDeliveryTimes = async () => {
    try {
      setIsLoadingDeliveryTimes(true);
      const res = await fetchApi({
        url: "settings/value/deliveryTime?language=en",
        method: "GET",
      });

      if (res?.success === 1 && res.data) {
        // If data is an array, use it directly
        if (Array.isArray(res.data)) {
          setDeliveryTimes(res.data);
        }
        // If data is a string, try to parse it as JSON
        else if (typeof res.data === "string") {
          try {
            const parsedData = JSON.parse(res.data);
            setDeliveryTimes(Array.isArray(parsedData) ? parsedData : []);
          } catch {
            setDeliveryTimes([]);
          }
        }
        // If data is an object with deliveryTime array
        else if (
          res.data.deliveryTime &&
          Array.isArray(res.data.deliveryTime)
        ) {
          setDeliveryTimes(res.data.deliveryTime);
        } else {
          setDeliveryTimes([]);
        }
      } else {
        setDeliveryTimes([]);
      }
    } catch (error) {
      console.error("Failed to fetch delivery times:", error);
      setDeliveryTimes([]);
    } finally {
      setIsLoadingDeliveryTimes(false);
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
      delivery_time: "", // 🔴 NEW: Default delivery time
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

  // Calculate subtotal from ALL cart items with proper price handling for variations
  const subtotal = useMemo(
    () =>
      cart?.reduce(
        (acc, item) => acc + getEffectivePrice(item) * item.quantity,
        0
      ) || 0,
    [cart]
  );

  // Calculate product discount (when price > sale_price and sale_price > 0)
  const productDiscount = useMemo(() => {
    return (
      cart?.reduce((acc, item) => {
        const regularPrice = item.product.price;
        const salePrice = item.product.sale_price || 0; // 🔴 FIX: Added null check

        if (salePrice > 0 && regularPrice > salePrice) {
          return acc + (regularPrice - salePrice) * item.quantity;
        }
        return acc;
      }, 0) || 0
    );
  }, [cart]);

  // Calculate shipping cost
  const shippingCost = useMemo(() => {
    if (!shippingClass) return 0;

    const shippingAmount = parseFloat(shippingClass.amount) || 0; // 🔴 FIX: Added null check

    if (shippingClass.type === "fixed") {
      return shippingAmount;
    } else if (shippingClass.type === "percentage") {
      return (subtotal * shippingAmount) / 100;
    } else if (shippingClass.type === "free_shipping") {
      return 0;
    }
    return 0;
  }, [shippingClass, subtotal]);

  // Calculate tax amount
  const taxAmount = useMemo(() => {
    if (!taxClass) return 0;

    const taxRate = parseFloat(taxClass.rate) || 0; // 🔴 FIX: Added null check
    const taxableAmount = subtotal - productDiscount;
    return (taxableAmount * taxRate) / 100;
  }, [taxClass, subtotal, productDiscount]);

  // Calculate coupon discount with minimum cart amount validation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    // Check minimum cart amount requirement
    const minCartAmount = parseFloat(appliedCoupon.minimum_cart_amount) || 0; // 🔴 FIX: Added null check
    const discountableAmount = subtotal - productDiscount;

    if (minCartAmount > 0 && subtotal < minCartAmount) {
      return 0; // Coupon not applicable if cart doesn't meet minimum amount
    }

    const couponAmount = parseFloat(appliedCoupon.amount) || 0; // 🔴 FIX: Added null check

    if (appliedCoupon.type === "fixed") {
      return Math.min(couponAmount, discountableAmount);
    } else if (appliedCoupon.type === "percentage") {
      return (discountableAmount * couponAmount) / 100;
    }
    return 0;
  }, [appliedCoupon, subtotal, productDiscount]);

  // Check if coupon meets minimum cart amount requirement
  const isCouponApplicable = useMemo(() => {
    if (!appliedCoupon) return true;

    const minCartAmount = parseFloat(appliedCoupon.minimum_cart_amount) || 0;
    return minCartAmount === 0 || subtotal >= minCartAmount;
  }, [appliedCoupon, subtotal]);

  // Calculate final total
  const finalTotal = useMemo(() => {
    return (
      subtotal - productDiscount - couponDiscount + shippingCost + taxAmount
    );
  }, [subtotal, productDiscount, couponDiscount, shippingCost, taxAmount]);

  const totalItems = useMemo(() => cart?.length || 0, [cart]);

  // Get shipping display information
  const getShippingInfo = () => {
    if (!shippingClass) {
      return { text: "Calculating...", amount: 0, isFree: false };
    }

    if (shippingClass.type === "free_shipping") {
      return { text: "Free Shipping", amount: 0, isFree: true };
    } else if (shippingClass.type === "fixed") {
      return {
        text: `Shipping: ${shippingClass.name}`,
        amount: parseFloat(shippingClass.amount) || 0,
        isFree: false,
      };
    } else if (shippingClass.type === "percentage") {
      return {
        text: `Shipping: ${shippingClass.name} (${shippingClass.amount}%)`,
        amount: (subtotal * parseFloat(shippingClass.amount)) / 100,
        isFree: false,
      };
    }

    return { text: "Standard Shipping", amount: 0, isFree: false };
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

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    const billingAddress = values.billing_address;

    // Validate required billing fields
    if (!billingAddress.street || !billingAddress.city) {
      setServerError(
        "Please fill in all required billing address fields (Street and City)."
      );
      return;
    }

    // 🔴 NEW: Validate delivery time is selected
    if (!values.delivery_time) {
      setServerError("Please select a delivery time");
      return;
    }

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
          },
      billing_address: {
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        postal_code: billingAddress.postal_code,
        country: billingAddress.country,
      },
      payment_method: selectedPayment,
      cart: cart?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product.id,
        variation_option_id: item.variation_option_id || null,
      })),
      // Required fields for backend calculation
      shipping_id: shippingClass?.id,
      tax_id: taxClass?.id,
      coupon_id: appliedCoupon?.id || null,
      customer_contact: values.phone,
      customer_id: user?.id || null,
      // 🔴 NEW: Add delivery time to order data
      delivery_time: values.delivery_time,
    };

    console.log("Submitting order data:", orderData);

    try {
      const res = await fetchApi({
        url: "order/cartcreate",
        method: "POST",
        data: orderData,
      });

      if (res?.success) {
        // Clear the entire cart after successful order
        await clear();

        // Get tracking number from response
        const trackingNumber = res.data?.tracking_number;

        if (trackingNumber) {
          // Redirect to order success page with tracking number
          router.push(`/order-success?tracking=${trackingNumber}`);
        } else {
          // Fallback: show success message and redirect to home
          toast.success(res.detail || "Order placed successfully!");
          router.push("/");
        }
      } else {
        setServerError(res?.detail || "Something went wrong.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setServerError("Network error. Please try again.");
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

  return (
    <Screen>
      <main className="mt-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
              <p className="text-muted-foreground">Complete your purchase</p>

              {/* Server Error Display */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {serverError}
                </div>
              )}

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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      <h3 className="font-semibold text-blue-900">
                        {shippingInfo.isFree
                          ? "🎉 Free Shipping!"
                          : "Shipping Information"}
                      </h3>
                      <p className="text-blue-700 text-sm">
                        {shippingInfo.isFree
                          ? "Your order qualifies for free shipping!"
                          : `${shippingInfo.text} - ${currencyFormatter(
                              shippingInfo.amount
                            )}`}
                      </p>
                    </div>
                  </div>
                  {shippingInfo.isFree && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      FREE
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Personal Information
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
                  </div>
                </div>
              )}

              {/* 🔴 NEW: Delivery Time Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery Time *</h3>
                <div className="space-y-2">
                  {isLoadingDeliveryTimes ? (
                    <div className="text-center py-4">
                      <p>Loading delivery times...</p>
                    </div>
                  ) : deliveryTimes.length > 0 ? (
                    <Select
                      onValueChange={(value) =>
                        setValue("delivery_time", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a delivery time" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryTimes.map((timeSlot, index) => (
                          <SelectItem
                            key={index}
                            value={timeSlot.title || `slot-${index}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {timeSlot.title}
                              </span>
                              {timeSlot.description && (
                                <span className="text-sm text-muted-foreground">
                                  {timeSlot.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
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
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalItems} item{totalItems !== 1 ? "s" : ""} in cart
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingTaxShipping && (
                <div className="text-center py-4">
                  <p>Loading shipping and tax information...</p>
                </div>
              )}

              {cart?.map((item, index) => {
                const {
                  product: { name, image, id, price, sale_price },
                  quantity,
                } = item || {};

                // ✅ Use the helper function to get correct price
                const unitPrice = getEffectivePrice(item);
                const subtotal = unitPrice * quantity;
                const variationText = getVariationDisplayText(item);

                // 🔴 FIX: Added null checks for price and sale_price
                const regularPrice = price || 0;
                const salePrice = sale_price || 0;
                const hasDiscount = salePrice > 0 && regularPrice > salePrice;
                const regularPriceTotal = regularPrice * quantity;

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
                        <div className="text-xs text-muted-foreground">
                          {currencyFormatter(unitPrice)} x {quantity}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-green-600">
                            Save{" "}
                            {currencyFormatter(regularPriceTotal - subtotal)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {currencyFormatter(subtotal)}
                    </span>
                  </div>
                );
              })}

              <Separator />

              {/* Shipping Information Display */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-600"
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
                    <div
                      className={`text-sm font-semibold ${
                        shippingInfo.isFree ? "text-green-600" : ""
                      }`}
                    >
                      {shippingInfo.isFree
                        ? "FREE"
                        : currencyFormatter(shippingInfo.amount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {shippingInfo.text}
                    </div>
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
                  <span>Subtotal</span>
                  <span>{currencyFormatter(subtotal)}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Product Discount</span>
                    <span>-{currencyFormatter(productDiscount)}</span>
                  </div>
                )}

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
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

                {taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>
                      Tax{" "}
                      {taxClass?.name &&
                        `(${taxClass.name} - ${taxClass.rate}%)`}
                    </span>
                    <span>{currencyFormatter(taxAmount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span>{currencyFormatter(finalTotal)}</span>
              </div>

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
                      id="creditCard"
                      checked={selectedPayment === "credit_card"}
                      onChange={() => setSelectedPayment("credit_card")}
                    />
                    <label
                      className="form-check-label flex items-center"
                      htmlFor="creditCard"
                    >
                      <img
                        src="/assets/imgs/card-icon.png"
                        className="mr-2 w-6 h-6"
                        alt=""
                      />
                      Credit/Debit card
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
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full mt-2"
                disabled={
                  isSubmitting ||
                  finalTotal <= 0 ||
                  isLoadingTaxShipping ||
                  isLoadingDeliveryTimes
                }
                size="lg"
                type="button"
              >
                {isSubmitting
                  ? "Processing..."
                  : `Place Order - ${currencyFormatter(finalTotal)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
