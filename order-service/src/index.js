require("dotenv").config();

const express = require("express");
const database = require("./infrastructure/database");
const RabbitMQClient = require("./infrastructure/messaging/RabbitMQClient");
const ErrorHandler = require("./adapters/presenters/middlewares/errorHandler");
const orderRoutes = require("./adapters/presenters/routes/OrderRoutes");
const productConsumer = require("./infrastructure/messaging/ProductConsumer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ErrorHandler.handleError);
app.use("/orders", orderRoutes);

app.use("/", (req, res) => {
  res.status(200).json({ hello: "world" });
});

async function startServer() {
  try {
    await database.connect();

    await RabbitMQClient.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );

    await productConsumer.start();

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing server");
  await database.disconnect();
  await RabbitMQClient.close();
  process.exit(0);
});

module.exports = app;
