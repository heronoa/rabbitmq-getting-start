const ProductService = require("../../domain/services/ProductService");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, quantity } = req.body;
    const newProduct = await ProductService.createProduct({
      name,
      price,
      description,
      quantity,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      error: "Failed to create product",
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await ProductService.getProducts();

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      error: "Failed to fetch products",
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      error: "Failed to fetch product",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, quantity } = req.body;

    const updatedProduct = await ProductService.updateProduct(productId, {
      name,
      price,
      description,
      quantity,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product: ", error);
    res.status(500).json({
      error: "Failed to update product",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await ProductService.deleteProduct(productId);

    if (!deletedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "Failed to delete product",
    });
  }
};
