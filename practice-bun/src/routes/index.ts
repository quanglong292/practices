import { Elysia } from "elysia";
import { healthRoutes } from "./health";
import { apiRoutes } from "./api";

export const routes = new Elysia({ name: "app.routes" })
  .use(healthRoutes)
  .use(apiRoutes);

export { healthRoutes, apiRoutes };
