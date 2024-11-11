const RabbitMQClient = require("./RabbitMQClient");
const CreateOrderAndSendMsg = require("../../domain/use-cases/CreateOrderAndSendMsg");

class ProductConsumer {
  static async start() {
    await RabbitMQClient.consumeFromQueue(
      process.env.PRODUCT_QUEUE_NAME,
      async (message) => {
        try {
          const { products, total } = message;
          const newOrder = await CreateOrderAndSendMsg.execute(products, total);
        } catch (error) {
          console.error("Failed to create order:", error);
        }
      }
    );
  }
}

module.exports = ProductConsumer;
