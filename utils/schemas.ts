import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const updateMessageStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Message ID is required"),
  }),
  body: z.object({
    isRead: z.boolean(),
  }),
});

export const bulkDeleteMessagesSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().min(1, "ID cannot be empty"))
      .min(1, "At least one ID is required"),
  }),
});

export const bulkUpdateStatusSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().min(1, "ID cannot be empty"))
      .min(1, "At least one ID is required"),
    isRead: z.boolean(),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Message ID is required"),
  }),
});
