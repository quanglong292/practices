import { Kafka, logLevel } from "kafkajs";
import { config } from "@/config";

export const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [...config.kafka.brokers],
  logLevel: config.env === "development" ? logLevel.INFO : logLevel.ERROR,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({
  groupId: `${config.kafka.clientId}-group`,
});

export default kafka;
