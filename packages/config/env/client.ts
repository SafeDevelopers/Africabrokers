import { z } from "zod";
import { clientEnvSchema } from "./schema";

type ClientEnv = z.infer<typeof clientEnvSchema>;

export function parseClientEnv(source: Record<string, string | undefined>): ClientEnv {
  const result = clientEnvSchema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.errors
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid client environment configuration:\n${formatted}`);
  }
  return result.data;
}

export type { ClientEnv };
