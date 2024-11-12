// use-cases/CreateProduct.js
const dotenv = require("dotenv");
const CheckProductsStock = require("./CheckProductsStock");

dotenv.config();

class BuyProducts {
  static async execute(products) {
    if (products.length < 0) {
      throw new Error("No products selected");
    }

    if (CheckProductsStock.execute(products)) {
      throw new Error("One of the products selected are sold out");
    }

    const order = products.reduce(
      (resultedOrder, item) => {
        resultedOrder.products.push({ product_id: item.id });
        resultedOrder.total += item.price;

        return resultado;
      },
      { products: [], total: 0 }
    );

    await RabbitMQClient.sendToQueue(process.env.ORDER_QUEUE_NAME, order);
  }
}

module.exports = BuyProducts;
