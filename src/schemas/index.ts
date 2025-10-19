import { z } from "zod";
import { zodType } from "./common";

export const loginSchema = z.object({
  email: zodType.email,
  password: zodType.password,
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

// ✅ Modern Zod schema with confirm password validation
export const registerSchema = z
  .object({
    name: zodType.user_name,

    email: zodType.email,

    phone_no: zodType.phone_no,

    password: zodType.password,

    confirm_password: zodType.confirm_password,
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const checkoutSchema = z.object({
  name: zodType.user_name,
  email: zodType.email,
  address: zodType.address,
  city: zodType.city,
  zip: zodType.zip,
  phone: zodType.phone_no,
});

export type CheckoutSchemaType = z.infer<typeof checkoutSchema>;
