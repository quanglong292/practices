import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { apiRouter } from "./routes/api";
import { errorHandler } from "./utils/error-handler";
import { env } from "./config/env";
import { redis } from "./config/redis";

// Connect to Redis on startup
await redis.connect();

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "CRM Dynamic Rule Engine Mock Server",
          version: "1.0.0",
          description:
            "Mock server for testing Dynamic Forms, EAV patterns, and Business Rule Engine (JsonLogic).",
        },
      },
    }),
  )
  .use(errorHandler)
  .use(apiRouter)
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 Swagger docs at http://${app.server?.hostname}:${app.server?.port}/swagger`,
);
