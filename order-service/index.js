const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const amqp = require("amqplib");

const Order = require("./models/Order");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let channel, connection;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Order-Service Connected to MongoDB"))
  .catch((error) => console.log(`Mongoose Connect Error: ${error}`));

// RabbitMQ connection
async function connectToRabbitMQ() {
  const amqpServer = process.env.RABBITMQ_URL;
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(process.env.ORDER_QUEUE_NAME);
}

createOrder = (products) => {
  let total = 0;
  products.forEach((product) => {
    total += product.price;
  });

  const order = new Order({
    products,
    total,
  });
  order.save();
  return order;
};

connectToRabbitMQ()
  .then(() => {
    channel.consume(process.env.ORDER_QUEUE_NAME, (data) => {
      // order service queue listens to this queue
      const { products } = JSON.parse(data.content);
      const newOrder = createOrder(products);
      channel.ack(data);
      channel.sendToQueue(
        process.env.PRODUCT_QUEUE_NAME,
        Buffer.from(JSON.stringify(newOrder))
      );
    });
  })
  .catch((error) => console.log(`RabbitMQ Connect Error: ${error}`));

app.listen(PORT, () => {
  console.log(`Order-Service listening on port ${PORT}`);
});
