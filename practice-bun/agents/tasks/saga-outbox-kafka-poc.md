# Flash Sale Inventory Buffer & Order Processing POC

## Overview

This POC demonstrates how Shopee handles ultra-high concurrency spikes during **Flash Sale campaigns (e.g., 11.11 / 12.12 at 00:00)** using Apache Kafka.

During flash sales, hundreds of thousands of users attempt to purchase heavily discounted, limited-stock items (e.g., 500 iPhones priced at 50% off) within seconds. This project implements an asynchronous buffer pipeline that ingests rapid purchase requests, prevents database saturation, guarantees zero overselling, and processes checkout transactions safely.

---

## Problem

When 100,000 requests hit the checkout endpoint concurrently for an item with only 500 units in stock:

```
[100k Concurrent Users] ──► [HTTP POST /checkout] ──► [Database: UPDATE inventory SET stock = stock - 1]
                                                                  │
                                                                  ▼
                                                      ❌ Connection Pool Exhausted
                                                      ❌ Row-level Lock Contention
                                                      ❌ Database Crash & Overselling

```

1. **Database Lock Contention:** Executing `UPDATE inventory SET stock = stock - 1 WHERE item_id = ?` under massive concurrency locks the exact same database row, causing latency to skyrocket and thread pools to deplete.
2. **Cascading Service Failures:** Web servers exhaust their database connection pools, blocking subsequent non-flash-sale requests across the platform.
3. **Double Spending / Overselling:** Race conditions between checking stock availability and updating the balance cause more items to be sold than physically exist in the warehouse.

---

## Solutions: Naive -> Best

### Naive Solution: Synchronous RDBMS Locking

- **Design:** Direct REST calls hitting PostgreSQL/MySQL wrapped in transactions (`SELECT FOR UPDATE`).
- **Why it fails:** Locks bottleneck immediately. At 50,000+ RPS, database CPU hits 100%, connections time out, and the checkout system crashes completely.

### Intermediate Solution: Redis Atomicity (`DECR` / Lua Script) Alone

- **Design:** Decrement inventory in Redis using atomic `DECR` commands. If stock $\ge 0$, call downstream database APIs to create orders.
- **Why it fails:** While Redis handles the read/decrement phase rapidly, downstream services (Order DB, Payment, Notification) cannot ingest write operations at Redis-level throughput, resulting in dropped requests or worker queue overflows without backpressure.

### Best Solution: Hybrid Redis Gatekeeper + Kafka Rate-Leveling Queue (Asynchronous Buffer)

- **Design:**

1. **Phase 1 (Gatekeeper):** Redis atomic Lua script evaluates stock. If stock is exhausted, immediately reject requests with HTTP 400 before touching any disk or network queues.
2. **Phase 2 (Buffer & Backpressure):** Approved purchase intents are pushed directly into a Kafka topic partitioned by `item_id`.
3. **Phase 3 (Controlled Persistence):** Downstream worker consumers pull batches from Kafka at a strictly capped, safe throughput (e.g., 1,000 RPS) to insert records into PostgreSQL and trigger payment reserves.

```
[User Request]
      │
      ▼
[API Gateway / Checkout Service]
      │
      ├── (1) Redis Lua Script (Atomic Pre-decrement)
      │       ├── If Stock <= 0 ──────────────► [Return 400: Sold Out]
      │       └── If Stock > 0 (Allowed)
      │
      └── (2) Kafka Producer (Produce 'flashsale.order.intent')
                    │
                    ▼
          [ Kafka Topic: Partition by item_id ]
                    │ (Controlled Polling / Backpressure)
                    ▼
          [ Order Processor Workers (Go / NestJS) ]
                    │
                    ▼
          [ PostgreSQL: INSERT order & Persistent Ledger ]

```

---

## How to Implement: Guide Step-by-Step

### Prerequisites

- Docker & Docker Compose installed.
- Node.js / TypeScript (or Go) runtime.
- Any HTTP load-testing CLI (e.g., `autocannon`, `k6`, or `vegeta`).

---

### Step 1: Spin up Infrastructure via Docker Compose

Create a `docker-compose.yml` file defining Kafka (KRaft mode), Redis, and PostgreSQL.

```yaml
version: "3.8"

services:
  kafka:
    image: apache/kafka:latest
    container_name: kafka-flashsale
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_NUM_PARTITIONS: 4

  redis:
    image: redis:alpine
    container_name: redis-flashsale
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    container_name: postgres-flashsale
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: shopee
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: flashsale_db
```

Start the containers:

```bash
docker compose up -d

```

---

### Step 2: Initialize Database and Redis Seed State

#### 1. PostgreSQL Schema

Connect to PostgreSQL and create the orders table:

```sql
CREATE TABLE orders (
    order_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    item_id VARCHAR(64) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

#### 2. Redis Stock Setup

Set the flash sale inventory for target item `ITEM_IPHONE_15` to **100 units**:

```bash
docker exec -it redis-flashsale redis-cli SET flashsale:stock:ITEM_IPHONE_15 100

```

---

### Step 3: Implement Checkout API (Producer + Redis Gatekeeper)

Install dependencies:

```bash
npm install express kafkajs ioredis uuid
npm install --save-dev typescript @types/express @types/ioredis @types/uuid @types/node

```

Create `producer.ts`:

```typescript
import express, { Request, Response } from "express";
import Redis from "ioredis";
import { Kafka, Partitioners } from "kafkajs";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

const redis = new Redis({ host: "localhost", port: 6379 });
const kafka = new Kafka({
  clientId: "checkout-api",
  brokers: ["localhost:9092"],
});
const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

// Atomic stock check and decrement script
const luaDeductStock = `
  local currentStock = redis.call('get', KEYS[1])
  if (not currentStock) then
      return -1
  end
  if (tonumber(currentStock) > 0) then
      redis.call('decr', KEYS[1])
      return 1
  else
      return 0
  end
`;

app.post("/api/v1/checkout", async (req: Request, res: Response) => {
  const { userId, itemId, amount } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ error: "Missing userId or itemId" });
  }

  try {
    // 1. Redis Gatekeeper: Pre-decrement stock atomically
    const result = await redis.eval(
      luaDeductStock,
      1,
      `flashsale:stock:${itemId}`,
    );

    if (result === -1) {
      return res.status(404).json({ error: "Item not found in flash sale" });
    }
    if (result === 0) {
      return res.status(410).json({ message: "Flash sale item sold out!" });
    }

    const orderPayload = {
      orderId: `ORD_${uuidv4()}`,
      userId,
      itemId,
      amount: amount || 999.0,
      timestamp: Date.now(),
    };

    // 2. Kafka Producer: Keyed by itemId to ensure ordered, partition-specific distribution
    await producer.send({
      topic: "flashsale.order.intent",
      messages: [
        {
          key: itemId,
          value: JSON.stringify(orderPayload),
        },
      ],
    });

    // 3. Return accepted state immediately (Asynchronous fulfillment)
    return res.status(202).json({
      status: "PENDING",
      message: "Order accepted, processing in queue...",
      orderId: orderPayload.orderId,
    });
  } catch (err: any) {
    // If Kafka publish fails, compensate Redis stock increment
    await redis.incr(`flashsale:stock:${itemId}`);
    return res
      .status(500)
      .json({ error: "Checkout system error", details: err.message });
  }
});

async function bootstrap() {
  await producer.connect();
  app.listen(3000, () => {
    console.log("⚡ Checkout API running on http://localhost:3000");
  });
}

bootstrap();
```

---

### Step 4: Implement the Order Consumer (Controlled DB Worker)

Create `consumer.ts`:

```typescript
import { Kafka } from "kafkajs";
import { Client } from "pg";

const kafka = new Kafka({
  clientId: "order-worker",
  brokers: ["localhost:9092"],
});
const consumer = kafka.consumer({ groupId: "flashsale-order-persister" });

const pgClient = new Client({
  connectionString:
    "postgresql://shopee:secretpassword@localhost:5432/flashsale_db",
});

async function runWorker() {
  await pgClient.connect();
  await consumer.connect();

  await consumer.subscribe({
    topic: "flashsale.order.intent",
    fromBeginning: false,
  });

  console.log("👷 Order Persistence Worker listening for events...");

  // Process events in controlled batches
  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({
      batch,
      resolveOffset,
      heartbeat,
      isRunning,
      isStale,
    }) => {
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) break;
        if (!message.value) continue;

        const order = JSON.parse(message.value.toString());

        try {
          // Persist order idempotently into database
          await pgClient.query(
            `INSERT INTO orders (order_id, user_id, item_id, amount, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (order_id) DO NOTHING`,
            [order.orderId, order.userId, order.itemId, order.amount, "PAID"],
          );

          console.log(
            `✅ [Persisted] Order: ${order.orderId} for User: ${order.userId}`,
          );
        } catch (error) {
          console.error(`❌ Failed to persist order ${order.orderId}:`, error);
          // In real production: route to a Dead Letter Queue (DLQ)
        }

        // Commit offset per message
        resolveOffset(message.offset);
        await heartbeat();
      }
    },
  });
}

runWorker().catch(console.error);
```

---

### Step 5: Execute Load Test & Verify Zero Overselling

1. Run the Producer:

```bash
npx ts-node producer.ts

```

2. Run the Worker in a separate terminal:

```bash
npx ts-node consumer.ts

```

3. Run an automated benchmark sending **1,000 rapid concurrent checkout requests** for our 100 available items:

```bash
npx autocannon -c 50 -d 10 -m POST \
  -H "Content-Type=application/json" \
  -b '{"userId":"USER_TEST","itemId":"ITEM_IPHONE_15","amount":999}' \
  http://localhost:3000/api/v1/checkout

```

4. **Verify Inventory Ledger in PostgreSQL:**

```bash
docker exec -it postgres-flashsale psql -U shopee -d flashsale_db -c "SELECT COUNT(*) FROM orders WHERE item_id = 'ITEM_IPHONE_15';"

```

**Expected Result:** Exact count of `100`. No database connection pool saturation occurred, zero race conditions emerged, and 900 excess requests were cleanly rejected with HTTP 410 before reaching PostgreSQL.

---

## What I Learned

1. **Backpressure & Decoupling:** Kafka does not push data onto the database; workers pull data at a controlled rate (`consumer.run({ eachBatch })`), safeguarding the storage layer from traffic spikes.
2. **Partitioning by Business Entity:** Setting `key = itemId` ensures all purchases for a specific product go to the same partition, preserving execution order for that exact product stream.
3. **Defense in Depth (Gatekeeper Pattern):** Never allow high-volume concurrent traffic to reach Kafka or databases when an in-memory gatekeeper (Redis Lua script) can drop 99% of invalid requests at sub-millisecond speeds.
4. **Idempotency is Non-Negotiable:** At-least-once message delivery in distributed systems means consumers can process duplicate messages; handling duplicates via database constraints (`ON CONFLICT DO NOTHING`) prevents duplicate charging and double order generation.
