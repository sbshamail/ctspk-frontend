"use client";
import { Screen } from "@/@core/layout";
import CheckoutForm from "@/components/forms/CheckoutForm";
import SiginModal from "@/components/modals/SiginModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const [openSiginModal, setOpenSiginModal] = useState(false);
  const { data: auth, isLoading } = useAppSelector(
    (state: RootState) => state.auth
  );

  return (
    <Screen>
      <main className="mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutForm />
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Meow For All Cats</span>
                <span>Rs 310</span>
              </div>
              <div className="flex justify-between">
                <span>Dog & Puppy Food Feast Pack</span>
                <span>Rs 2500</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>Rs 2810</span>
              </div>
              <Separator />
              {auth ? (
                <button
                  className={cn(
                    "w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition "
                  )}
                >
                  Proceed to Payment →
                </button>
              ) : (
                <SiginModal
                  open={openSiginModal}
                  setOpen={setOpenSiginModal}
                  trigger={
                    <button
                      className={cn(
                        "w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition ",
                        isLoading && "animate-pulse"
                      )}
                    >
                      Login to Proceed →
                    </button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
