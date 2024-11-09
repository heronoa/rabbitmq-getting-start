// services/orderService.js
const createOrder = require("../use-cases/CreateOrder");
const getOrder = require("../use-cases/GetOrder");
const deleteOrder = require("../use-cases/DeleteOrder");
const updateOrder = require("../use-cases/UpdateOrder");

// Criar um novo pedido
exports.createOrder = async (products, total) => {
  try {
    const newOrder = await createOrder.execute(products, total);

    return newOrder;
  } catch (error) {
    throw new Error("Error creating order");
  }
};

// Listar todos os pedidos
exports.getOrders = async () => {
  try {
    return await getOrder.all();
  } catch (error) {
    throw new Error("Error fetching orders");
  }
};

// Buscar um pedido por ID
exports.getOrderById = async (orderId) => {
  try {
    return await getOrder.findById(orderId);
  } catch (error) {
    throw new Error("Error fetching order");
  }
};

// Atualizar um pedido
exports.updateOrder = async (orderId, products, total) => {
  try {
    const order = await updateOrder.one(
      orderId,
      {
        products,
        total,
      },
      { new: true }
    );

    return order;
  } catch (error) {
    throw new Error("Error updating order");
  }
};

// Deletar um pedido
exports.deleteOrder = async (orderId) => {
  try {
    const order = await deleteOrder.execute(orderId);
    return order;
  } catch (error) {
    throw new Error("Error deleting order");
  }
};