const RabbitMQClient = require("./RabbitMQClient");
const CreateOrderAndSendMsg = require("../../domain/use-cases/CreateOrderAndSendMsg");

class OrderConsumer {
  static async start() {
    await RabbitMQClient.consumeFromQueue(
      process.env.ORDER_QUEUE_NAME,
      async (message) => {
        try {
          const { products, total } = message;
          const newOrder = await CreateOrderAndSendMsg.execute(products, total);
          console.log("New order created: " + newOrder._id);
        } catch (error) {
          console.error("Failed to create order:", error);
        }
      }
    );
  }
}

module.exports = OrderConsumer;
