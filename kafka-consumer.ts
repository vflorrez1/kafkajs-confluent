import {
  Consumer,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  Kafka,
  EachMessagePayload,
} from "kafkajs";
// import ip from 'ip';
// import fs from 'fs';

// const host = process.env.HOST_IP || ip.address()

export default class ConusmerFactory {
  private kafkaConsumer: Consumer;

  public constructor() {
    this.kafkaConsumer = this.createKafkaConsumer();
  }

  public async startConsumer(theTopic: string): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: [theTopic],
      fromBeginning: false,
    };

    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(topic);

      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
          console.log(`- ${prefix} ${message.key}#${message.value}`);
        },
      });
    } catch (error) {
      console.log("Error: ", error);
    }
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
      console.log("Error: ", error);
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  private createKafkaConsumer(): Consumer {
    const kafka = new Kafka({
      logLevel: 4,
      clientId: "example-consumer",
      // brokers: [`localhost:9092`],
      brokers: ["pkc-ymrq7.us-east-2.aws.confluent.cloud:9092"],
      // ssl: {
      //   servername: 'localhost',
      //   rejectUnauthorized: false,
      //   ca: [fs.readFileSync('./testHelpers/certs/cert-signed', 'utf-8')],
      // },
      sasl: {
        mechanism: "plain",
        username: "N7QZA3ALE2UYJ35Y",
        password:
          "bEDi3BG0HJ7RihgmFyZUJ7xTd/rXNoBm8P+Mw+j7lNv2WdHuvrBUR0Hpzo966Mak",
      },
    });
    const consumer = kafka.consumer({ groupId: "consumer-group" });
    return consumer;
  }
}
