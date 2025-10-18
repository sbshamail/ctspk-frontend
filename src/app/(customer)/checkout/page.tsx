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

export default function CheckoutPage() {
  const router = useRouter();
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { data: auth, isLoading } = useSelection("auth");
  const { data: selectedCart } = useSelection("selectedCart");
  const { refetchCart, cart } = useCartService();
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = auth || {};
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
      country: "",
      phone: user?.phone_no || "",
    },
  });

  const total = useMemo(
    () =>
      selectedCart?.reduce(
        (acc, item) =>
          acc + (item.product.salePrice ?? item.product.price) * item.quantity,
        0
      ),
    []
  );
  const onSubmit = async (values: CheckoutSchemaType) => {
    setServerError(null);
    toast.success("Order completed successfully!");
    reset();
    if (!user) {
      setOpenSiginModal(true);
      return;
    }
    router.push("/product");
    // alert("Order completed successfully!");
    // try {
    //   const res = await fetchApi({
    //     url: "order/creates",
    //     method: "POST",
    //     data: values,
    //   });
    //     reset();

    //   if (res?.success) {
    //     alert("Order completed successfully!");
    //   } else {
    //     setServerError(res?.detail || "Something went wrong.");
    //   }
    // } catch (err) {
    //   setServerError("Network error. Please try again.");
    // }
  };
  if (!selectedCart || selectedCart?.length == 0) {
    return router.push("/cart");
  }
  return (
    <Screen>
      <main className="mt-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <Card className="lg:col-span-2">
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
                  product: { name, price, salePrice, image, id },
                  quantity,
                } = item || {};
                const actualPrice = salePrice ?? price;
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
              {/* {auth ? ( */}
              <Button onClick={handleSubmit(onSubmit)} className="w-full">
                Cash On Delivery →
              </Button>
              {/* // ) : (
                // <SiginModal
                //   open={openSiginModal}
                //   setOpen={setOpenSiginModal}
                //   trigger={
                //     <Button
                //       className={cn("w-full ", isLoading && "animate-pulse")}
                //     >
                //       Login to Proceed →
                //     </Button>
                //   }
                // />
              // )} */}
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
