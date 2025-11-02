import { z } from "zod";
import { serverEnvSchema } from "./schema";

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function loadServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.errors
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment configuration:\n${formatted}`);
  }
  cachedEnv = result.data;
  return cachedEnv;
}

export type { ServerEnv };
