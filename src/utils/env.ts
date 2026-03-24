import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional().default("8080"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  CORS_ORIGINS: z.string().min(1, "CORS_ORIGINS is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  RESEND_API_KEY: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .optional()
    .default("debug"),
  LOG_EMOJI: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
  LOG_THEME: z.enum(["dark", "light"]).optional().default("dark"),
  FORCE_COLOR: z.string().optional(),

  // Captcha
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.safeParse(process.env);

if (!env.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", env.error.format());
  process.exit(1);
}

export const ENV = env.data;
