import { describe, expect, it } from "bun:test";
import { app } from "@/index";

describe("REST API Suite", () => {
  it("should return root info at GET /", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("should return health status at GET /health", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
  });

  it("should list users with pagination at GET /api/users", async () => {
    const res = await app.handle(new Request("http://localhost/api/users?limit=5&page=1"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.meta.limit).toBe(5);
  });

  it("should fail validation on invalid user creation at POST /api/users", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );
    // Elysia schema validation returns 422
    expect(res.status).toBe(422);
  });

  it("should sign in successfully at POST /api/auth/sign-in", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "alice@example.com",
          password: "password123",
        }),
      })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe("alice@example.com");
  });
});
