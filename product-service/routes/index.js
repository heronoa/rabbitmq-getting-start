const dotenv = require("dotenv");
const amqp = require("amqplib");

const Router = require("express").Router;

const Product = require("../models/Product");

dotenv.config();

const router = Router();
let order, channel, connection;

async function connectToRabbitMQ() {
  const amqpServer = process.env.RABBITMQ_URL;
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();

  await channel.assertQueue(process.env.PRODUCT_QUEUE_NAME);
}

connectToRabbitMQ()
  .then(() => {
    console.log("Product-Service Connected to RabbitMQ");
  })
  .catch((error) => console.log(`RabbitMQ Connect Error: ${error}`));

router.post("/", async (req, res) => {
  const {
    name = undefined,
    price = undefined,
    description = undefined,
  } = req.body;

  if (!name || !price || !description) {
    return res.status(422).json({
      message:
        "Missing Parameter, Be sure to provide a name, a price and a description for the product",
    });
  }

  const product = new Product({
    ...req.body,
  });

  await product.save();

  return res.status(201).json({
    message: "Product created successfully",
    product,
  });
});

router.post("/buy", async (req, res) => {
  const { productIds = undefined } = req.body;

  if (!productIds) {
    return res.status(422).json({
      message: "Missing Parameter, Be sure to provide at least one productId",
    });
  }

  const products = await Product.find({ _id: { $in: productIds } });

  channel.sendToQueue(
    process.env.ORDER_QUEUE_NAME,
    Buffer.from(
      JSON.stringify({
        products,
      })
    )
  );

  channel.consume(process.env.PRODUCT_QUEUE_NAME, (data) => {
    console.log(`Consumed from ${process.env.PRODUCT_QUEUE_NAME}`);

    order = JSON.parse(data.content);
    channel.ack(data);
  });

  return res.status(201).json({
    message: "Order placed successfully",
    order,
  });
});

module.exports = router;
