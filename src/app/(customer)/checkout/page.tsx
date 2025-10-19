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
import { checkoutSchema, CheckoutSchemaType } from "@/schemas";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import CheckoutForm from "@/components/forms/CheckoutForm";
import SiginModal from "@/components/modals/SiginModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartService } from "@/lib/cartService";
import { setReducer } from "@/store/common/action-reducer";
import { useMountAfterEffect } from "@/@core/hooks";

export default function CheckoutPage() {
  const router = useRouter();
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");
  const isAuth = !!auth?.user?.id;
  const setSelectedCart = setReducer("selectedCart");
  const { data: selectedCart, dispatch } = useSelection("selectedCart", true);
  const { refetchCart, cart, removeSelected } = useCartService();
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = auth || {};
  // if auth then selected cart state will be updated
  useMountAfterEffect(() => {
    if (cart) {
      setSelectedCart(cart);
    }
  }, [isAuth]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutSchemaType>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: "",
      city: "",
      zip: "",
      // country: "Pakistan",
      phone: user?.phone_no || "",
    },
  });

  const total = useMemo(
    () =>
      selectedCart?.reduce(
        (acc, item) =>
          acc + (item.product.sale_price ?? item.product.price) * item.quantity,
        0
      ),
    []
  );
  const onSubmit = async (values: CheckoutSchemaType) => {
    const data = {
      shipping_address: values,
      cart: selectedCart?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product.id,
      })),
    };

    try {
      const res = await fetchApi({
        url: "order/cartcreate",
        method: "POST",
        data,
      });

      if (res?.success) {
        removeSelected(selectedCart?.map((x) => x?.product?.id) ?? []);

        toast.success(res.detail);
        router.push("/product");
      } else {
        setServerError(res?.detail || "Something went wrong.");
      }
    } catch (err) {
      setServerError("Network error. Please try again.");
    }
  };
  if (!selectedCart || selectedCart?.length == 0) {
    return router.push("/cart");
  }
  return (
    <Screen>
      <main className="mt-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutForm
                auth={auth}
                serverError={serverError}
                register={register}
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCart?.map((item, index) => {
                const {
                  product: { name, price, sale_price, image, id },
                  quantity,
                } = item || {};
                const actualPrice = sale_price ?? price;
                return (
                  <div
                    key={id}
                    className="flex gap-2 items-center justify-between h-10 "
                  >
                    <div className="flex items-center gap-2 h-10">
                      <Image
                        src={image.original}
                        alt={name}
                        className="object-contain h-10 rounded-lg"
                        width={50}
                        height={50}
                      />
                      <span className="text-sm">{name}</span>
                    </div>
                    <span className="text-sm whitespace-nowrap">
                      {currencyFormatter(actualPrice * quantity)}
                      <sup>
                        {actualPrice} x {quantity}
                      </sup>
                    </span>
                  </div>
                );
              })}

              <Separator />
              <div className="flex items-center justify-between mx-4">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  {currencyFormatter(total ?? 0)}/-
                </span>
              </div>
              {/* {isAuth ? ( */}
              <Button onClick={handleSubmit(onSubmit)} className="w-full">
                Cash On Delivery →
              </Button>
              {!isAuth && (
                <>
                  <Separator />
                  <p className="italic text-xs">Offline Order</p>
                  <Separator />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
