const createProduct = require("../use-cases/CreateProduct");
const getProduct = require("../use-cases/GetProduct");
const deleteProduct = require("../use-cases/DeleteProduct");
const updateProduct = require("../use-cases/UpdateProduct");
const buyProducts = require("../use-cases/BuyProducts");

exports.buyProducts = async (products) => {
  try {
    const order = await buyProducts.execute(products);

    return order;
  } catch (error) {
    throw new Error("Service error creating product");
  }
};

exports.createProduct = async ({ name, price, description, quantity }) => {
  try {
    const newProduct = await createProduct.execute({
      name,
      price,
      description,
      quantity,
    });

    return newProduct;
  } catch (error) {
    throw new Error("Error creating product");
  }
};

exports.getProducts = async () => {
  try {
    return await getProduct.all();
  } catch (error) {
    throw new Error("Error fetching products");
  }
};

exports.getProductById = async (productId) => {
  try {
    return await getProduct.byId(productId);
  } catch (error) {
    throw new Error("Error fetching product");
  }
};

exports.updateProduct = async (productId, productUpdated) => {
  try {
    const {
      name = undefined,
      price = undefined,
      description = undefined,
      quantity = undefined,
    } = productUpdated;

    const product = await updateProduct.one(productId, {
      name,
      price,
      description,
      quantity,
    });

    return product;
  } catch (error) {
    throw new Error("Error updating product");
  }
};

exports.deleteProduct = async (productId) => {
  try {
    const product = await deleteProduct.execute(productId);
    return product;
  } catch (error) {
    throw new Error("Error deleting product");
  }
};
