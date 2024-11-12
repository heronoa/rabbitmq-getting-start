const RabbitMQClient = require("./RabbitMQClient");
const Product = require("../../domain/entities/Product");

class ProductConsumer {
  static async start() {
    await RabbitMQClient.consumeFromQueue(
      process.env.PRODUCT_QUEUE_NAME,
      async (message) => {
        try {
          const { products } = message;
          console.log({ message, products });
          const productIdCounts = products
            .map((p) => p.product_id)
            .reduce((acc, id) => {
              acc[id] = (acc[id] || 0) + 1;
              return acc;
            }, {});

          const updatePromises = Object.keys(productIdCounts).map((id) => {
            const count = productIdCounts[id];
            return Product.updateOne(
              { _id: id },
              { $inc: { quantity: -count } }
            );
          });

          const result = await Promise.all(updatePromises);

          console.log(`Updated ${result.length} products`);
          return result;
        } catch (error) {
          console.error("Error updating products:", error);
          throw error;
        }
      }
    );
  }
}

module.exports = ProductConsumer;
