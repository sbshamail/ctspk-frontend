import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Enter a valid email address",
    }),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

// ✅ Modern Zod schema with confirm password validation
export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),

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
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
