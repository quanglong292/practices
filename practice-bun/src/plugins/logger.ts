import { Elysia } from "elysia";

export const logger = new Elysia({ name: "plugin.logger" })
  .onRequest(({ request }) => {
    // Record request start timestamp
    (request as Request & { _startTime?: number })._startTime = performance.now();
  })
  .onAfterResponse(({ request, set }) => {
    const start = (request as Request & { _startTime?: number })._startTime;
    const duration = start ? `${(performance.now() - start).toFixed(2)}ms` : "";
    const method = request.method;
    const url = new URL(request.url).pathname;
    const status = set.status || 200;

    console.log(`[HTTP] ${method} ${url} -> ${status} (${duration})`);
  });
