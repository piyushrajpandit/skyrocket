/**
 * Zod validation schemas for SkyMock API inputs.
 * Compatible with Zod v4 — uses .min(1) for required string checks
 * instead of the v3-only { required_error } config.
 */

import { z } from "zod";

export const bookingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian number"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  flightId: z
    .string()
    .min(1, "Flight ID is required"),
  flightName: z
    .string()
    .min(1, "Flight name is required"),
  price: z
    .number()
    .min(0, "Price cannot be negative"),
  seatPreference: z
    .enum(["Window", "Aisle", "Middle"])
    .optional(),
  status: z
    .enum(["pending", "confirmed", "cancelled"])
    .optional(),
  pointsDiscount: z.number().min(0).optional(),
});

export const cancelSchema = z.object({
  bookingId: z
    .string()
    .min(6, "Invalid booking ID"),
});

export const agentMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
  provider: z
    .enum(["claude", "openai", "gemini"])
    .optional(),
  race: z.boolean().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string()
    .min(1, "Order ID is required"),
  razorpay_payment_id: z
    .string()
    .min(1, "Payment ID is required"),
  razorpay_signature: z
    .string()
    .min(1, "Signature is required"),
  bookingData: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    flightId: z.string().min(1),
    flightName: z.string().min(1),
    price: z.number().min(0),
    seatPreference: z.enum(["Window", "Aisle", "Middle"]).optional(),
  }),
});

export const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
});

export const redeemPointsSchema = z.object({
  pointsToUse: z.number().positive("Points must be a positive number"),
  ticketPrice: z.number().positive("Ticket price must be positive"),
});

/**
 * Helper: formats Zod errors into a human-readable string.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
}
