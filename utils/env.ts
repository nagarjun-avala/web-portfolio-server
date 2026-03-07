import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional().default("8080"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  FRONTEND_URLS: z.string().min(1, "FRONTEND_URLS is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  RESEND_API_KEY: z.string().optional(),
});

export const env = envSchema.safeParse(process.env);

if (!env.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", env.error.format());
  process.exit(1);
}

export const ENV = env.data;
