"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutForm() {
  return (
    <form className="space-y-6">
      {/* Billing Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="John" required />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Doe" required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" placeholder="123 Street Name" required />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Lahore" required />
          </div>
          <div>
            <Label htmlFor="zip">Postal Code</Label>
            <Input id="zip" placeholder="54000" required />
          </div>
        </div>
      </section>

      {/* Payment Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
          </div>
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input id="expiry" placeholder="MM/YY" required />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" placeholder="123" required />
          </div>
        </div>
      </section>

      <Button type="submit" className="w-full">
        Complete Order
      </Button>
    </form>
  );
}
