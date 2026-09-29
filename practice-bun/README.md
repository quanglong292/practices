# Practice Bun + Elysia RESTful API

A modular, production-ready RESTful API architecture built with **Bun** and **Elysia.js**, designed according to the official [Elysia Development Best Practices](agents/skills/elysia-development.md).

---

## 📁 Project Architecture

The architecture follows a **feature-based MVC pattern** decoupled from framework specifics:

```text
practice-bun/
├── src/
│   ├── config/                  # App configuration & environment variables
│   │   └── index.ts
│   ├── modules/                 # Feature-based RESTful modules
│   │   ├── auth/                # Authentication feature
│   │   │   ├── index.ts         # Controller (Elysia routing & cookies)
│   │   │   ├── model.ts         # Elysia `t` validation schemas & types
│   │   │   └── service.ts       # Business logic (Argon2/bcrypt password hashing)
│   │   └── users/               # User management feature (CRUD)
│   │       ├── index.ts         # Controller (Route endpoints & validation)
│   │       ├── model.ts         # Elysia `t` schemas & DTO types
│   │       └── service.ts       # Business logic (Data operations)
│   ├── plugins/                 # Reusable Elysia plugins
│   │   ├── error-handler.ts     # Global error catching & custom HTTP errors
│   │   └── logger.ts            # Request/response execution timing logger
│   ├── routes/                  # Central routing layer
│   │   ├── api.ts               # Aggregates /api routes (auth, users, etc.)
│   │   ├── health.ts            # System and health check routes
│   │   └── index.ts             # Main router aggregating all route sets
│   ├── utils/                   # Shared helper utilities
│   │   └── response.ts          # Unified JSON API response helpers
│   └── index.ts                 # Main app entry point (mounts modules & starts server)
├── tests/
│   └── api.test.ts              # Automated tests with bun:test and Elysia handle()
├── package.json
└── tsconfig.json                # Configured with `@/*` path aliases
```

---

## 🧩 Architectural Principles (from Elysia Skill Guide)

1. **Feature-based Organization**:
   - Each domain resource lives inside its own folder under `src/modules/<resource>/`.
   - Keeps related routes, logic, and schemas together for clean scaling.

2. **1 Elysia Instance = 1 Controller**:
   - Route handlers are declared on Elysia instances instead of coupled class methods to maintain Elysia's type inference.

3. **Services are Abstracted & Decoupled**:
   - Non-request dependent services use `abstract class` with `static` methods to avoid unnecessary class allocations.
   - Independent of HTTP Context for unit testing without mock web requests.

4. **Single Source of Truth with Models**:
   - Elysia's Type system (`t.Object`, `t.String`, etc.) generates both runtime schema validation and compile-time TypeScript types via `UnwrapSchema`.

5. **Modern Bun Capabilities**:
   - Native password hashing via `Bun.password.hash` / `Bun.password.verify`.
   - Ultra-fast native testing via `bun test` and Elysia's `app.handle(Request)`.

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
bun run dev
```

### 2. Run Test Suite
```bash
bun test
```

---

## 📡 API Endpoints

### System
- `GET /` - API health and server metadata
- `GET /health` - Service uptime and status

### Authentication (`/api/auth`)
- `POST /api/auth/sign-in` - Sign in user with email & password
- `POST /api/auth/sign-up` - Register a new account

### Users (`/api/users`)
- `GET /api/users` - Paginated user list (`?limit=10&page=1`)
- `GET /api/users/:id` - Fetch user by ID
- `POST /api/users` - Create user with validated body
- `PATCH /api/users/:id` - Partial update user
- `DELETE /api/users/:id` - Remove user