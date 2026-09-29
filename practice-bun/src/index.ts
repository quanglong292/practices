import { Elysia } from "elysia";
import { config } from "@/config";
import { errorHandler } from "@/plugins/error-handler";
import { logger } from "@/plugins/logger";
import { routes } from "@/routes";

export const app = new Elysia()
  // Global Plugins
  .use(errorHandler)
  .use(logger)

  // Mount Application Routes
  .use(routes)

  // Start Server
  .listen(config.port);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(`📡 API Base: http://${app.server?.hostname}:${app.server?.port}${config.apiPrefix}`);

// Export App type for client type-safety (Eden Treaty)
export type App = typeof app;
