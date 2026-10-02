const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create a new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "No order items provided",
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({
        message: "Shipping address is incomplete",
      });
    }

    const verifiedOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const pId = item.productId || item.id;
      let product = null;

      if (pId !== undefined && pId !== null) {
        if (typeof pId === "number" || !isNaN(Number(pId))) {
          product = await Product.findOne({ productId: Number(pId) });
        }
        if (!product && mongoose.Types.ObjectId.isValid(pId)) {
          product = await Product.findById(pId);
        }
      }

      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.name || pId}`,
        });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          message: `Invalid quantity for product '${product.name}'`,
        });
      }

      if (product.stock !== undefined && product.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${qty}`,
        });
      }

      const itemTotal = product.price * qty;
      calculatedItemsPrice += itemTotal;

      verifiedOrderItems.push({
        productId: product.productId,
        name: product.name,
        quantity: qty,
        price: product.price,
        image: product.images?.[0] || product.image || item.image || "",
      });
    }

    const calculatedShippingPrice = calculatedItemsPrice > 0 ? 99 : 0;
    const calculatedTaxPrice = Math.round(calculatedItemsPrice * 0.18);
    const calculatedTotalPrice =
      calculatedItemsPrice + calculatedShippingPrice + calculatedTaxPrice;

    const orderId = "SC" + Math.floor(100000 + Math.random() * 900000);

    const order = await Order.create({
      orderId,
      user: req.user ? req.user._id : undefined,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "Cash on Delivery",
      itemsPrice: calculatedItemsPrice,
      shippingPrice: calculatedShippingPrice,
      taxPrice: calculatedTaxPrice,
      totalPrice: calculatedTotalPrice,
      isPaid: false,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isMongoId
      ? { $or: [{ orderId: req.params.id }, { _id: req.params.id }] }
      : { orderId: req.params.id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Security check: Ensure order belongs to logged-in user or admin
    const isOwner =
      order.user &&
      req.user &&
      order.user.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized to access this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};

