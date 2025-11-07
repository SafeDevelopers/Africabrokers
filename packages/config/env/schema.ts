import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().regex(/^\d+$/).default("4000"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  STORAGE_ENDPOINT: z.string().url(),
  STORAGE_BUCKET: z.string(),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  OIDC_ISSUER_URL: z.string().url(),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
  TELEBIRR_SANDBOX_API_KEY: z.string(),
  TELEBIRR_SANDBOX_SECRET: z.string()
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_BASE_URL: z.string().url(),
  NEXT_PUBLIC_TENANT_KEY: z.string().optional()
});
