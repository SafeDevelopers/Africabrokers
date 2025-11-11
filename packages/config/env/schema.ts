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
  S3_PUBLIC_BASE_URL: z.string().url().optional(), // Optional: Public base URL for generating file URLs
  KEYCLOAK_REALM: z.string().min(1),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),
  KEYCLOAK_ISSUER: z.string().url(),
  KEYCLOAK_JWKS_URI: z.string().url().optional(), // Optional: JWKS URI for token verification
  KEYCLOAK_AUDIENCE: z.string().min(1),
  KEYCLOAK_ADMIN: z.string().optional(), // Optional: Keycloak admin username (defaults to 'admin')
  KEYCLOAK_ADMIN_PASSWORD: z.string().optional(), // Optional: Keycloak admin password (required for automatic user creation)
  // Legacy OIDC variables (optional, for backward compatibility)
  OIDC_ISSUER_URL: z.string().url().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  TELEBIRR_SANDBOX_API_KEY: z.string(),
  TELEBIRR_SANDBOX_SECRET: z.string()
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_BASE_URL: z.string().url(),
  NEXT_PUBLIC_TENANT_KEY: z.string().optional()
});
