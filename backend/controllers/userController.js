const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

// Helper to resolve product from productId (Number) or _id (ObjectId)
const findProduct = async (paramId) => {
  if (paramId === undefined || paramId === null || paramId === "") {
    return { error: "Product ID is required", status: 400 };
  }

  const isNum =
    typeof paramId === "number" ||
    (!isNaN(Number(paramId)) && String(paramId).trim() !== "");
  const isValidObjId = mongoose.Types.ObjectId.isValid(paramId);

  if (!isNum && !isValidObjId) {
    return { error: "Invalid product ID format", status: 400 };
  }

  let product = null;
  if (isNum) {
    product = await Product.findOne({ productId: Number(paramId) });
  }

  if (!product && isValidObjId) {
    product = await Product.findById(paramId);
  }

  if (!product) {
    return { error: "Product not found", status: 404 };
  }

  return { product };
};

// Helper to format user cart items for clean frontend consumption
const formatCartItems = (cartArray = []) => {
  return cartArray
    .filter((item) => item.product) // Filter out deleted products
    .map((item) => {
      const p = item.product;
      return {
        id: p.productId,
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        discount: p.discount,
        rating: p.rating,
        reviews: p.reviews || p.numReviews || 0,
        ai: p.ai,
        favorite: p.favorite,
        images: p.images,
        image: p.images?.[0] || p.image || "",
        stock: p.stock,
        quantity: item.quantity,
      };
    });
};

// Helper to format user wishlist items
const formatWishlistItems = (wishlistArray = []) => {
  return wishlistArray
    .filter((p) => p !== null && p !== undefined) // Filter deleted products
    .map((p) => ({
      id: p.productId,
      _id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      discount: p.discount,
      rating: p.rating,
      reviews: p.reviews || p.numReviews || 0,
      ai: p.ai,
      favorite: true,
      images: p.images,
      image: p.images?.[0] || p.image || "",
      stock: p.stock,
    }));
};

// @desc    Get user cart from MongoDB
// @route   GET /api/users/cart
// @access  Private
const getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedCart = formatCartItems(user.cart);
    res.status(200).json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// @desc    Add / Update item in user cart
// @route   PUT /api/users/cart
// @access  Private
const updateUserCart = async (req, res) => {
  try {
    const { productId, quantity, action, cartItems } = req.body;

    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Support bulk sync if cartItems array is provided
    if (Array.isArray(cartItems)) {
      const newCart = [];
      for (const item of cartItems) {
        const { product } = await findProduct(item.productId || item.id);
        if (product) {
          const qty = Math.max(1, Number(item.quantity) || 1);
          newCart.push({
            product: product._id,
            quantity: qty,
          });
        }
      }
      user.cart = newCart;
      await user.save();
      const updatedUser = await User.findById(user._id).populate("cart.product");
      return res.status(200).json({
        success: true,
        cart: formatCartItems(updatedUser.cart),
      });
    }

    // Single item update/add
    const pId = productId || req.body.id;
    if (!pId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const { product, error: prodErr, status: prodStatus } = await findProduct(pId);
    if (prodErr) {
      return res.status(prodStatus).json({ message: prodErr });
    }

    const qty = Number(quantity);
    if (isNaN(qty)) {
      return res.status(400).json({ message: "Quantity must be a valid number" });
    }

    // Check stock if quantity > 0
    if (qty > 0 && product.stock !== undefined && qty > product.stock) {
      return res.status(400).json({
        message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${qty}`,
      });
    }

    const existingIndex = user.cart.findIndex(
      (item) => item.product && item.product._id.toString() === product._id.toString()
    );

    if (qty <= 0) {
      // Remove item if quantity is 0 or less
      if (existingIndex > -1) {
        user.cart.splice(existingIndex, 1);
      }
    } else if (action === "set") {
      // Set exact quantity
      if (existingIndex > -1) {
        user.cart[existingIndex].quantity = qty;
      } else {
        user.cart.push({ product: product._id, quantity: qty });
      }
    } else {
      // Default: add or set quantity
      if (existingIndex > -1) {
        // If action is add, increment quantity or set
        if (action === "add") {
          user.cart[existingIndex].quantity += qty;
        } else {
          user.cart[existingIndex].quantity = qty;
        }
      } else {
        user.cart.push({ product: product._id, quantity: qty });
      }
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate("cart.product");

    res.status(200).json({
      success: true,
      cart: formatCartItems(updatedUser.cart),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// @desc    Remove item from user cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
const removeUserCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { product, error: prodErr, status: prodStatus } = await findProduct(productId);
    if (prodErr) {
      return res.status(prodStatus).json({ message: prodErr });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.product && item.product.toString() !== product._id.toString()
    );

    await user.save();
    const updatedUser = await User.findById(user._id).populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: formatCartItems(updatedUser.cart),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      wishlist: formatWishlistItems(user.wishlist),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToUserWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const { product, error: prodErr, status: prodStatus } = await findProduct(productId);
    if (prodErr) {
      return res.status(prodStatus).json({ message: prodErr });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.wishlist.some(
      (id) => id && id.toString() === product._id.toString()
    );

    if (!exists) {
      user.wishlist.push(product._id);
      await user.save();
    }

    const updatedUser = await User.findById(user._id).populate("wishlist");

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: formatWishlistItems(updatedUser.wishlist),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update wishlist",
      error: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromUserWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const { product, error: prodErr, status: prodStatus } = await findProduct(productId);
    if (prodErr) {
      return res.status(prodStatus).json({ message: prodErr });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id && id.toString() !== product._id.toString()
    );

    await user.save();
    const updatedUser = await User.findById(user._id).populate("wishlist");

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: formatWishlistItems(updatedUser.wishlist),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

module.exports = {
  getUserCart,
  updateUserCart,
  removeUserCartItem,
  getUserWishlist,
  addToUserWishlist,
  removeFromUserWishlist,
};
