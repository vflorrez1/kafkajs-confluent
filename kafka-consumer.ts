import {
  Consumer,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  Kafka,
} from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const broker = process.env.KAFKA_BROKER || "";
const userKey = process.env.KAFKA_USERNAME || "";
const userPass = process.env.KAFKA_PASSWORD || "";
const clientId = process.env.KAFKA_CLIENT_ID || "test-id";

const consumerGroup =
  process.env.KAFKA_CONSUMER_GROUP_ID || "some-consumer-group";

export default class ConusmerFactory {
  private kafkaConsumer: Consumer;

  public constructor() {
    this.kafkaConsumer = this.createKafkaConsumer();
  }

  public async startBatchConsumer(theTopic: string): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: [theTopic],
      fromBeginning: false,
    };

    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(topic);
      await this.kafkaConsumer.run({
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload;
          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);
          }
        },
      });
    } catch (error) {
      console.log("BIG FAT ERROR???????? ", error);
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  private createKafkaConsumer(): Consumer {
    const kafka = new Kafka({
      logLevel: 4,
      clientId: clientId,
      brokers: [broker],
      ssl: true,
      sasl: {
        mechanism: "plain",
        username: userKey,
        password: userPass,
      },
    });
    kafka.logger;
    const consumer = kafka.consumer({ groupId: consumerGroup });

    consumer.on("consumer.connect", () => {
      console.info("[Kafka] Connected to Kafka");
    });

    consumer.on("consumer.crash", (e) => {
      console.log("big fat crash??", e);
    });
    consumer.on("consumer.rebalancing", () =>
      console.info("[Kafka] Rebalancing topic")
    );

    consumer.on("consumer.stop", () =>
      console.info("[Kafka] Kafka consumer stopped")
    );

    consumer.on("consumer.group_join", () => {
      console.info("[Kafka] Consumer connected and joined the group");
    });

    consumer.on("consumer.disconnect", () => {
      console.info("[Kafka] Consumer disconnected");
    });
    return consumer;
  }
}
