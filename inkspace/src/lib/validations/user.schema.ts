import { z } from "zod";

export const AdminUserMutationSchema = z.object({
  targetUserId: z.string().min(1),
  role: z.enum(["READER", "WRITER", "ADMIN"]),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  reason: z.string().trim().min(5, "Audit reason required").max(500),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "Explicit consent is required to subscribe to the editorial dispatch.",
  }),
});