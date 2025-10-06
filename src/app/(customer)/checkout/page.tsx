"use client";
import { Screen } from "@/@core/layout";
import CheckoutForm from "@/components/forms/CheckoutForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clientUser } from "@/action/auth";

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState(clientUser());

  useEffect(() => {
    // If not logged in, start watching for login changes
    if (!user) {
      const interval = setInterval(() => {
        const current = clientUser();

        // detect login (object changed)
        if (JSON.stringify(current) !== JSON.stringify(user)) {
          setUser(current);
          if (current) {
            // ✅ user just logged in
            clearInterval(interval);
            router.push("/checkout"); // or refresh page, or close modal, etc.
          }
        }
      }, 1000); // every 1s

      // cleanup when unmounts
      return () => clearInterval(interval);
    }
  }, [user, router]);
  const handleLogin = () => {
    router.push("/login");
  };

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
              {user ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
                  Proceed to Payment →
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                >
                  Login to Proceed →
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Screen>
  );
}
