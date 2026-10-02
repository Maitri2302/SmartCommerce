const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  getCategories,
} = require("../controllers/productController");

const {
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

router.post("/:id/reviews", protect, createProductReview);
router.get("/:id/reviews", getProductReviews);
router.delete("/:productId/reviews/:reviewId", protect, deleteReview);

module.exports = router;