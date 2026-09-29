export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  apiPrefix: "/api",
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
} as const;

export type AppConfig = typeof config;
