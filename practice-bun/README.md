# Shopee & Shopee Logistics Backend (Bun + Elysia + Kafka + Redis + PGSQL)

A high-performance, modular, event-driven e-commerce and logistics backend inspired by the **Shopee** ecosystem (including **Shopee Logistics / SPX**). Built with **Bun**, **Elysia.js**, **Prisma ORM**, **PostgreSQL**, **Redis**, and **Apache Kafka**.

---

## 🛍️ Domain Scope & Architecture

This project simulates the high-throughput, distributed workflows of a modern e-commerce platform and its integrated fulfillment network:

### 1. E-Commerce Core
- **Products & Flash Sales**: Product catalog, category hierarchies, SKU variations, and lightning-fast Redis-backed flash sale inventory reservation.
- **Cart & Orders**: Cart management, checkout lifecycle, voucher application, and atomic order placement.
- **Inventory & Pricing**: Multi-warehouse stock tracking, concurrency-safe inventory deduction.

### 2. Shopee Logistics (SPX / Shopee Express)
- **Fulfillment & Waybill**: Waybill/tracking number generation (e.g., `SPX-VN-XXXXXXXX`) immediately upon order confirmation.
- **Hub & Sorting Network**: Parcel intake, sortation between Central Sorting Hubs (SOC) and Local Delivery Hubs (LM).
- **Driver Dispatch & Delivery**: Courier route assignment, delivery attempts, proof-of-delivery (POD), and COD handling.
- **Real-Time Parcel Tracking**: Live shipment milestone history powered by asynchronous event processing.

### 3. High-Performance Infrastructure Stack
- **Apache Kafka (KRaft mode)**: Asynchronous event backbone decoupling order processing from logistics fulfillment, notification services, and analytics (e.g., `order.placed`, `parcel.sorted`, `parcel.dispatched`, `parcel.delivered`).
- **Redis 7**: Distributed caching, inventory decrement locks, session caching, and rate limiting.
- **PostgreSQL 16 & Prisma 7**: Strongly-typed ACID persistence for financial, order, user, and parcel records.
- **Bun & Elysia.js**: Sub-millisecond HTTP latency, native type safety with TypeBox/Elysia `t`, and instant startup.

---

## 📁 Project Architecture

The codebase follows a **feature-based MVC pattern** designed for domain scalability:

```text
practice-bun/
├── docker-compose.yml       # Orchestrates Postgres, Redis, Kafka (KRaft), Kafka UI
├── prisma/
│   └── schema.prisma        # Prisma schema definitions (Postgres datasource)
├── prisma7.config.ts        # Prisma 7 configuration file
├── src/
│   ├── config/              # Centralized environment & service configuration
│   │   └── index.ts         # Server, database, Redis, and Kafka settings
│   ├── modules/             # Feature-based domain modules
│   │   ├── auth/            # Authentication & session management
│   │   │   ├── index.ts     # Elysia route controllers
│   │   │   ├── model.ts     # Validation schemas & DTO types (`t`)
│   │   │   └── service.ts   # Business logic (Bun native password hashing)
│   │   ├── users/           # User & buyer/seller profile management
│   │   │   ├── index.ts     # Controllers
│   │   │   ├── model.ts     # DTOs & validation schemas
│   │   │   └── service.ts   # Data access & services
│   │   ├── orders/          # [Shopee Core] Order placement & checkout
│   │   ├── products/        # [Shopee Core] Catalog & inventory management
│   │   └── logistics/       # [Shopee SPX] Parcels, tracking, hub routing & dispatch
│   ├── plugins/             # Reusable Elysia plugins
│   │   ├── error-handler.ts # Global error catching & formatted HTTP responses
│   │   └── logger.ts        # Request execution & timing logger
│   ├── routes/              # Central route aggregation layer
│   │   ├── api.ts           # Aggregates /api routes (auth, users, orders, logistics)
│   │   ├── health.ts        # System health & dependency status
│   │   └── index.ts         # Main router entry point
│   ├── utils/               # Shared utilities & client singletons
│   │   ├── kafka.ts         # Singleton Kafka client, producer, and consumer
│   │   ├── prisma.ts        # Singleton PrismaClient with @prisma/adapter-pg
│   │   ├── redis.ts         # Singleton Redis client (ioredis)
│   │   └── response.ts      # Unified JSON API response helpers
│   └── index.ts             # Application entry point
├── tests/
│   ├── api.test.ts          # REST API integration tests via bun:test
│   └── stack.test.ts        # Infrastructure clients initialization tests
├── .env                     # Local environment secrets & connection URLs
├── .env.example             # Template for required environment variables
├── package.json
└── tsconfig.json            # Configured with `@/*` path aliases
```

---

## ⚡ Event-Driven Workflow (E-Commerce ➔ Logistics)

```
[Buyer: Checkout]
       │
       ▼
 [POST /api/orders] ──(Deduct Redis Stock & Commit DB)──┐
                                                        │
                                                        ▼
                                            Kafka: `order.placed`
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
         [Logistics Consumer (SPX)]                                              [Notification Service]
      - Generate Waybill Tracking Number                                          - Send Buyer Receipt
      - Create Initial Parcel Record
      - Publish `parcel.registered`
                      │
                      ▼
            [Hub Sortation Events]
      - `parcel.in_transit` (SOC ➔ LM Hub)
      - `parcel.out_for_delivery` (Driver assigned)
      - `parcel.delivered` (POD confirmed)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh) (v1.2+)
- [Docker & Docker Compose](https://docs.docker.com/compose/) *(Ensure WSL 2 integration is enabled on Windows)*

### 2. Start Infrastructure (Postgres, Redis, Kafka)
```bash
bun run docker:up
# Or: docker compose up -d
```

| Service | Port | Description |
|---|---|---|
| **PostgreSQL** | `5432` | Primary database (`devdb`) |
| **Redis** | `6379` | Cache & atomic inventory locks |
| **Kafka Broker** | `9092` | KRaft event broker |
| **Kafka UI** | `8080` | Web dashboard at [http://localhost:8080](http://localhost:8080) |

### 3. Setup Environment & Database
```bash
# Verify .env matches your local setup
cp .env.example .env

# Run Prisma database migrations
bun run db:migrate

# (Optional) Open Prisma Studio database viewer
bun run db:studio
```

> **Tip**: You can bootstrap infrastructure and migrations in one command with `bun run setup`.

### 4. Run Development Server
```bash
bun run dev
# Or start infra and dev server together:
bun run startup
```
The server will start at `http://localhost:3000`.

### 5. Run Automated Tests & Type Check
```bash
bun test
bun run typecheck
```

---

## 📡 API Endpoints (Overview)

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

### Logistics & Tracking (Planned / In-Progress)
- `POST /api/logistics/shipments` - Create shipment & generate tracking code
- `GET /api/logistics/track/:trackingNumber` - Retrieve real-time parcel transit timeline
- `POST /api/logistics/hub/scan` - Record hub sortation checkpoint event