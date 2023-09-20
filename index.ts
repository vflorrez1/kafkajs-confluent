import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ConusmerFactory from "./kafka-consumer";

dotenv.config();

const app: Express = express();
const port = process.env.CONSUMER_PORT;

const consumer = new ConusmerFactory();
consumer.startBatchConsumer("topic_2");
// consumer.startConsumer("topic_2");

app.get("/", (req: Request, res: Response) => {
  res.send("Is consuming");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
