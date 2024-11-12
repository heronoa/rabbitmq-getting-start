const RabbitMQClient = require("./RabbitMQClient");
const CreateOrderAndSendMsg = require("../../domain/use-cases/CreateProductAndSendMsg");

class OrderConsumer {
  static async start() {
    await RabbitMQClient.consumeFromQueue(
      process.env.PRODUCT_QUEUE_NAME,
      async (message) => {
        try {
          const { products, total } = message;

          // update stock
        } catch (error) {
          console.error("Failed to create order:", error);
        }
      }
    );
  }
}

module.exports = OrderConsumer;
