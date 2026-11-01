import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  bio: z.string().trim().max(400).optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(128),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500).optional().nullable(),
  avatarUrl: z
    .string()
    .trim()
    .refine((v) => !v || /^(https:\/\/|\/images\/|\/uploads\/)/.test(v), "Invalid avatar URL")
    .optional()
    .nullable(),
  // Strictly forbid role or status fields in user self-profile updates
}).strict();
