const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const formattedProducts = products.map((product) => ({
      id: product.productId,
      name: product.name,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount,
      rating: product.rating,
      reviews: product.reviews,
      ai: product.ai,
      favorite: product.favorite,
      images: product.images,
      specifications: product.specifications,
      stock: product.stock,
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      productId: Number(req.params.id),
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const formattedProduct = {
      id: product.productId,
      name: product.name,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice,
      discount: product.discount,
      rating: product.rating,
      reviews: product.reviews,
      ai: product.ai,
      favorite: product.favorite,
      images: product.images,
      specifications: product.specifications,
      stock: product.stock,
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
};
