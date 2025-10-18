import z from "zod";

export const zodType = {
  user_name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Enter a valid email address",
    }),
  phone_no: z
    .string()
    .min(1, { message: "Phone number is required" })
    .refine((val) => /^\d{10,15}$/.test(val), {
      message: "Enter a valid phone number (10–15 digits)",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirm_password: z
    .string()
    .min(6, { message: "Confirm password is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  zip: z.string().min(1, { message: "Postal code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
};
