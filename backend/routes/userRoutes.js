const express = require("express");
const router = express.Router();

const {
  getUserCart,
  updateUserCart,
  removeUserCartItem,
  getUserWishlist,
  addToUserWishlist,
  removeFromUserWishlist,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Protected Cart Endpoints
router.get("/cart", protect, getUserCart);
router.put("/cart", protect, updateUserCart);
router.delete("/cart/:productId", protect, removeUserCartItem);

// Protected Wishlist Endpoints
router.get("/wishlist", protect, getUserWishlist);
router.post("/wishlist/:productId", protect, addToUserWishlist);
router.delete("/wishlist/:productId", protect, removeFromUserWishlist);

module.exports = router;
