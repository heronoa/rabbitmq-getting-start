const express = require("express");
const dotenv = require("dotenv");

const startMongoDb = require("./infrastructure/database/mongodb");
const RabbitMQClient = require("./infrastructure/messaging/RabbitMQClient");

const CreateOrder = require("./domain/use-cases/CreateOrder");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await startMongoDb();

// RabbitMQ connection
await RabbitMQClient.connect(process.env.RABBITMQ_URL);

await RabbitMQClient.consumeFromQueue(
  process.env.ORDER_QUEUE_NAME,
  (data, client) => {
    // order service queue listens to this queue
    const { products } = JSON.parse(data.content);
    const newOrder = CreateOrder(products);

    client._channel.sendToQueue(
      process.env.PRODUCT_QUEUE_NAME,
      Buffer.from(JSON.stringify(newOrder))
    );
  }
);

app.listen(PORT, () => {
  console.log(`Order-Service listening on port ${PORT}`);
});
