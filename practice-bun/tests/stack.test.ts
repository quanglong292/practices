import { describe, expect, it } from "bun:test";
import { prisma } from "@/utils/prisma";
import { redis } from "@/utils/redis";
import { kafka, kafkaProducer, kafkaConsumer } from "@/utils/kafka";

describe("Stack Initialization Suite", () => {
  it("should initialize Prisma client", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
  });

  it("should initialize Redis client", () => {
    expect(redis).toBeDefined();
    expect(typeof redis.get).toBe("function");
  });

  it("should initialize Kafka client, producer, and consumer", () => {
    expect(kafka).toBeDefined();
    expect(kafkaProducer).toBeDefined();
    expect(kafkaConsumer).toBeDefined();
    expect(typeof kafkaProducer.connect).toBe("function");
  });
});
