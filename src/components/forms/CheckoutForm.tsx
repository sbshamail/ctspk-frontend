"use client";

import { getAuth } from "@/action/auth";
import {
  FieldErrors,
  FormState,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "../formFields/InputField";
import { checkoutSchema, CheckoutSchemaType } from "@/schemas";
import { useState } from "react";
import { AuthDataType } from "@/utils/modelTypes";
interface CheckoutFormProps {
  auth: AuthDataType | null;
  serverError: string | null;
  register: UseFormRegister<CheckoutSchemaType>;
  errors: FieldErrors<CheckoutSchemaType>;
}
export default function CheckoutForm({
  auth,
  serverError,
  register,
  errors,
}: CheckoutFormProps) {
  const { user } = auth || {};

  return (
    <form className="space-y-6">
      {/* Billing Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="name"
            label="Name"
            placeholder="John"
            register={register}
            error={errors.name}
          />
          <InputField
            id="email"
            type="email"
            label="Email Address"
            placeholder="john@example.com"
            register={register}
            error={errors.email}
          />
        </div>
      </section>

      {/* Shipping Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="address"
            label="Street Address"
            placeholder="123 Street Name"
            register={register}
            error={errors.address}
            className="md:col-span-2"
          />
          <InputField
            id="city"
            label="City"
            placeholder="Lahore"
            register={register}
            error={errors.city}
          />
          <InputField
            id="zip"
            label="Postal Code"
            placeholder="54000"
            register={register}
            error={errors.zip}
          />
          <InputField
            id="country"
            label="Country"
            placeholder="Pakistan"
            register={register}
            error={errors.country}
          />
          <InputField
            id="phone"
            label="Phone"
            placeholder="923001234567"
            register={register}
            error={errors.phone}
          />
        </div>
      </section>

      {/* Payment Info */}
      {/* <section className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="cardNumber"
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            register={register}
            error={errors.cardNumber}
            className="md:col-span-2"
          />
          <InputField
            id="expiry"
            label="Expiry Date"
            placeholder="MM/YY"
            register={register}
            error={errors.expiry}
          />
          <InputField
            id="cvc"
            label="CVC"
            placeholder="123"
            register={register}
            error={errors.cvc}
          />
        </div>
      </section> */}

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}
