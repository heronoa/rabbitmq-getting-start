// use-cases/CreateOrder.js
const Order = require("../entities/Order");

class UpdateOrder {
  static async one(id, products, total) {
    // A lógica de negócios de criar um pedido
    if (total <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    if (products.length <= 0) {
      throw new Error("Must send at least one product");
    }
    if (!id) {
      throw new Error("No id has been provided");
    }

    // Criando um novo pedido
    const orderFouded = Order.findById(id);

    orderFouded.total = total;
    orderFouded.products = products;

    // Persistindo o pedido no banco de dados via o repositório
    const updatedOrder = await Order.save(orderFouded);

    return updatedOrder;
  }
}

module.exports = UpdateOrder;
