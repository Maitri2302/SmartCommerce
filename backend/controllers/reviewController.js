const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Review comment is required",
      });
    }

    const paramId = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(paramId);
    let product = null;

    if (!isNaN(Number(paramId))) {
      product = await Product.findOne({ productId: Number(paramId) });
    }
    if (!product && isMongoId) {
      product = await Product.findById(paramId);
    }

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Prevent duplicate review by same user
    const alreadyReviewed = await Review.findOne({
      product: product._id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      name: req.user.name,
      rating: numericRating,
      comment: comment.trim(),
    });

    // Recalculate average rating and numReviews
    const allReviews = await Review.find({ product: product._id });
    const numReviews = allReviews.length;
    const avgRating =
      numReviews === 0
        ? 0
        : Number(
            (
              allReviews.reduce((acc, item) => item.rating + acc, 0) /
              numReviews
            ).toFixed(1)
          );

    product.rating = avgRating;
    product.numReviews = numReviews;
    product.reviews = numReviews;
    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
      rating: avgRating,
      numReviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const paramId = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(paramId);
    let product = null;

    if (!isNaN(Number(paramId))) {
      product = await Product.findOne({ productId: Number(paramId) });
    }
    if (!product && isMongoId) {
      product = await Product.findById(paramId);
    }

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const reviews = await Review.find({ product: product._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      rating: product.rating,
      numReviews: product.numReviews || product.reviews || 0,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        message: "Invalid review ID format",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Only review owner (or admin) can delete
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this review",
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating & numReviews
    const remainingReviews = await Review.find({ product: productId });
    const numReviews = remainingReviews.length;
    const avgRating =
      numReviews === 0
        ? 0
        : Number(
            (
              remainingReviews.reduce((acc, item) => item.rating + acc, 0) /
              numReviews
            ).toFixed(1)
          );

    const product = await Product.findById(productId);
    if (product) {
      product.rating = avgRating;
      product.numReviews = numReviews;
      product.reviews = numReviews;
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Review removed successfully",
      rating: avgRating,
      numReviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = {
  createProductReview,
  getProductReviews,
  deleteReview,
};
