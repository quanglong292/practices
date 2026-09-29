import { Elysia } from "elysia";

export const healthRoutes = new Elysia({ name: "routes.health" })
  .get("/", () => ({
    name: "Practice Bun & Elysia API",
    version: "1.0.0",
    docs: "/swagger",
    status: "ok",
  }))
  .get("/health", () => ({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));
