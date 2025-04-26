import { z } from "zod";

export const addressSchema = z.object({
  fullname: z.string()
  .trim()
  .min(1, "Full name is required")
  .refine((val) => !/^\d+$/.test(val), {
    message: "Full name cannot be only numbers",
  }),
  phone: z.string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
    email: z.string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.(com|net|org|in|co|io|gov|edu|email|info|biz)$/, 
      "Email must have a valid domain extension"),
  addressLine: z.string().min(1, "Address line is required").trim(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  pincode: z.string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Postal code must be 6 digits and cannot start with 0")
    .refine((val) => !/^(\d)\1{5}$/.test(val), {
      message: "Postal code cannot be all repeating digits",
    }),
  country: z.string().min(1, "Country is required").trim(),
  addressType: z.string().min(1, "Address type is required").trim(),
  isDefault: z.boolean(),
});
