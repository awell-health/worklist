import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    APPLICATION_NAME: z.string().min(1),
    APPLICATION_PORT: z.coerce.number().int().positive().min(1).max(65535),
    CLOSE_GRACE_DELAY: z.coerce.number().default(1000),
    DBSQL_URL: z.string().min(1),
    CACHE_URI: z.string().min(1),
    LOGTO_ENDPOINT: z.string().min(1),
    LOGTO_APP_ID: z.string().min(1),
    LOGTO_APP_SECRET: z.string().min(1),
    LOGTO_API_RESOURCE: z.string().min(1),
    LOGTO_HEADER_NAME: z.string().min(1).default("x-tenant-id"),
    LOGTO_JWT_CLAIM: z.string().min(1).default("tenantId"), 
  },
  runtimeEnv: process.env,
});
