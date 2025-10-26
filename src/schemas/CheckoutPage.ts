// src/schemas/CheckoutPage.ts
import { z } from "zod";

// Base checkout schema
export const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().optional().default(""),
  country: z.string().optional().default("Pakistan"),
  phone: z.string().min(1, "Phone number is required"),
});

// Extended checkout schema with billing address
export const extendedCheckoutSchema = checkoutSchema.extend({
  billing_address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional().default("Federal"),
    postal_code: z.string().optional().default(""),
    country: z.string().optional().default("Pakistan"),
  }),
});

// Export the inferred type
export type ExtendedCheckoutSchemaType = z.infer<typeof extendedCheckoutSchema>;