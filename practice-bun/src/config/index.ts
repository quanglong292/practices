export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  apiPrefix: "/api",
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
  database: {
    url: process.env.DATABASE_URL || "postgresql://devuser:devpassword@localhost:5432/devdb?schema=public",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || "practice-bun-app",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  },
} as const;

export type AppConfig = typeof config;
