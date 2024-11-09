require("dotenv").config();

const express = require("express");
const database = require("./infrastructure/database");
const RabbitMQClient = require("./infrastructure/messaging/RabbitMQClient"); // Exemplo de integração opcional
const orderRoutes = require("./adapters/presenters/routes/OrderRoutes"); // Exemplo de rotas de pedidos
const ErrorHandler = require("./adapters/presenters/middlewares/errorHandler"); // Middleware de tratamento de erros

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    await database.connect();

    await RabbitMQClient.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );

    app.use(ErrorHandler.handleError);
    app.use("/orders", orderRoutes);

    app.use("/", (req, res) => {
      res.status(200).json({ hello: "world" });
    });

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

module.exports = {app, startServer};
