"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast, Toaster } from "sonner";
import { fetchApi } from "@/action/fetchApi";
import { Screen } from "@/@core/layout";
import { cn } from "@/lib/utils";

import { useSelection } from "@/lib/useSelection";
import { currencyFormatter } from "@/utils/helper";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import SiginModal from "@/components/modals/auth/SiginModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartService } from "@/lib/cartService";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Create a complete checkout schema from scratch
const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().optional().default(""),
  country: z.string().optional().default("Pakistan"),
  phone: z.string().min(1, "Phone number is required"),
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
      return parseFloat(variation.price);
    }
  }

  // For simple products, use sale price if available, otherwise regular price
  return item.product.sale_price > 0
    ? item.product.sale_price
    : item.product.price;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");
  const isAuth = !!auth?.user?.id;
  const { refetchCart, cart, removeSelected, clear } = useCartService();
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = auth || {};
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(!isAuth);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("cash_on_delivery");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Fetch addresses if user is authenticated
  useEffect(() => {
    if (isAuth && user?.id) {
      fetchAddresses();
    }
  }, [isAuth, user?.id]);

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
      const billingStreet = watch("billing_address.street");
      const billingCity = watch("billing_address.city");
      const billingPostalCode = watch("billing_address.postal_code");
      const billingCountry = watch("billing_address.country");

      setValue("address", billingStreet);
      setValue("city", billingCity);
      setValue("zip", billingPostalCode);
      setValue("country", billingCountry);
    }
  }, [shipToDifferentAddress, watch, setValue]);

  // Calculate total from ALL cart items with proper price handling for variations
  const total = useMemo(
    () =>
      cart?.reduce(
        (acc, item) => acc + getEffectivePrice(item) * item.quantity,
        0
      ) || 0,
    [cart]
  );

  const totalItems = useMemo(() => cart?.length || 0, [cart]);

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    const billingAddress = values.billing_address;

    // Validate required billing fields
    if (!billingAddress.street || !billingAddress.city) {
      setServerError(
        "Please fill in all required billing address fields (Street and City)."
      );
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
        toast.success(res.detail);
        router.push("/product");
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
              {cart?.map((item, index) => {
                const {
                  product: { name, image, id },
                  quantity,
                } = item || {};

                // ✅ Use the helper function to get correct price
                const unitPrice = getEffectivePrice(item);
                const subtotal = unitPrice * quantity;
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
                        <div className="text-xs text-muted-foreground">
                          {currencyFormatter(unitPrice)} x {quantity}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {currencyFormatter(subtotal)}
                    </span>
                  </div>
                );
              })}

              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">
                  {currencyFormatter(total)}/-
                </span>
              </div>
              <Separator />

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
                disabled={isSubmitting || total === 0}
                size="lg"
                type="button"
              >
                {isSubmitting ? "Processing..." : "Place an Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
