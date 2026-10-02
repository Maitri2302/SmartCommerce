require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const http = require("http");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

async function runPhase4Tests() {
  console.log("=== PHASE 4 USER CART & WISHLIST PERSISTENCE TESTS ===");

  await connectDB();

  // Create temporary express app for clean test environment
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Setup Test Data
    console.log("\n[Setup] Cleaning old test users and products...");
    const emailA = "cart_user_a@example.com";
    const emailB = "cart_user_b@example.com";

    await User.deleteMany({ email: { $in: [emailA, emailB] } });

    const passwordHash = require("bcryptjs").hashSync("password123", 10);
    const userA = await User.create({
      name: "Cart User A",
      email: emailA,
      password: passwordHash,
      cart: [],
      wishlist: [],
    });

    const userB = await User.create({
      name: "Cart User B",
      email: emailB,
      password: passwordHash,
      cart: [],
      wishlist: [],
    });

    const jwtSecret = process.env.JWT_SECRET || "smartcommerce_secret_key_12345";
    const tokenA = jwt.sign({ id: userA._id }, jwtSecret, { expiresIn: "1h" });
    const tokenB = jwt.sign({ id: userB._id }, jwtSecret, { expiresIn: "1h" });

    // Fetch or create sample product
    let product1 = await Product.findOne();
    if (!product1) {
      product1 = await Product.create({
        productId: 991,
        name: "Test Smart Watch",
        category: "Wearables",
        price: 199,
        countInStock: 10,
        description: "Test product for cart/wishlist",
      });
    }

    console.log(`✓ Setup complete. User A ID: ${userA._id}, User B ID: ${userB._id}, Product ID: ${product1._id}`);

    // Helper fetch function
    const fetchApi = async (path, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    // 2. Test Unauthorized Access (No Token)
    console.log("\n[Test 1] Testing Unauthorized Cart & Wishlist Access (No Token)...");
    const unauthCart = await fetchApi("/api/users/cart");
    if (unauthCart.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated cart access, got ${unauthCart.status}`);
    }

    const unauthWishlist = await fetchApi("/api/users/wishlist");
    if (unauthWishlist.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated wishlist access, got ${unauthWishlist.status}`);
    }
    console.log("✓ SUCCESS: Unauthenticated access to cart & wishlist correctly rejected with 401.");

    // 3. Test Cart Operations for User A
    console.log("\n[Test 2] Adding item to User A's cart via PUT /api/users/cart...");
    const addRes = await fetchApi("/api/users/cart", {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        productId: product1._id.toString(),
        quantity: 2,
        action: "set",
      }),
    });

    if (addRes.status !== 200 || !addRes.data.cart || addRes.data.cart.length !== 1) {
      throw new Error(`Failed to add item to User A cart: ${JSON.stringify(addRes.data)}`);
    }
    if (addRes.data.cart[0].quantity !== 2) {
      throw new Error(`Expected quantity 2, got ${addRes.data.cart[0].quantity}`);
    }
    console.log("✓ SUCCESS: Item added to User A's cart in MongoDB with quantity 2.");

    // 4. Test Fetching Cart (GET /api/users/cart)
    console.log("\n[Test 3] Fetching User A's cart via GET /api/users/cart...");
    const getCartRes = await fetchApi("/api/users/cart", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (getCartRes.status !== 200 || getCartRes.data.cart.length !== 1) {
      throw new Error("Failed to fetch User A's cart");
    }
    console.log("✓ SUCCESS: User A's cart successfully fetched with populated product info.");

    // 5. Test User Isolation (User B cannot see User A's cart)
    console.log("\n[Test 4] Verifying User Isolation (User B fetching own cart)...");
    const getCartBRes = await fetchApi("/api/users/cart", {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (getCartBRes.status !== 200 || getCartBRes.data.cart.length !== 0) {
      throw new Error("User isolation failed: User B sees items from User A's cart!");
    }
    console.log("✓ SUCCESS: User isolation intact. User B's cart is empty as expected.");

    // 6. Test User B cannot remove User A's cart item
    console.log("\n[Test 5] User B trying to remove User A's item from User B's cart endpoint...");
    await fetchApi(`/api/users/cart/${product1._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const checkCartA = await fetchApi("/api/users/cart", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (checkCartA.data.cart.length !== 1) {
      throw new Error("Security vulnerability: User B was able to modify User A's cart!");
    }
    console.log("✓ SUCCESS: User B cannot modify User A's cart state.");

    // 7. Test Wishlist Operations for User A
    console.log("\n[Test 6] Adding product to User A's wishlist via POST /api/users/wishlist/:productId...");
    const addWishRes = await fetchApi(`/api/users/wishlist/${product1._id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (addWishRes.status !== 200 || !addWishRes.data.wishlist || addWishRes.data.wishlist.length !== 1) {
      throw new Error(`Failed to add product to User A wishlist: ${JSON.stringify(addWishRes.data)}`);
    }
    console.log("✓ SUCCESS: Product added to User A's wishlist in MongoDB.");

    // 8. Test Wishlist User Isolation (User B wishlist should be empty)
    console.log("\n[Test 7] Verifying Wishlist User Isolation (User B fetching wishlist)...");
    const getWishB = await fetchApi("/api/users/wishlist", {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (getWishB.status !== 200 || getWishB.data.wishlist.length !== 0) {
      throw new Error("User isolation failed: User B sees User A's wishlist!");
    }
    console.log("✓ SUCCESS: User B's wishlist is isolated and empty.");

    // 9. Test Wishlist Removal for User A
    console.log("\n[Test 8] Removing product from User A's wishlist via DELETE /api/users/wishlist/:productId...");
    const delWishRes = await fetchApi(`/api/users/wishlist/${product1._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (delWishRes.status !== 200 || delWishRes.data.wishlist.length !== 0) {
      throw new Error("Failed to remove product from User A wishlist");
    }
    console.log("✓ SUCCESS: Product removed from User A's wishlist in MongoDB.");

    // 10. Test Login Restoration (Simulating login -> fetching MongoDB cart & wishlist)
    console.log("\n[Test 9] Testing Login -> Cart & Wishlist Restoration from MongoDB...");
    const loginRes = await fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: emailA, password: "password123" }),
    });
    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error("Login failed during restoration test");
    }
    const freshToken = loginRes.data.token;
    const restoredCart = await fetchApi("/api/users/cart", {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
    if (restoredCart.data.cart.length !== 1) {
      throw new Error("Login restoration failed: Cart data not retrieved after login");
    }
    console.log("✓ SUCCESS: Authenticated user's cart successfully restored from MongoDB after login.");

    // 11. Test Invalid Validation Handling
    console.log("\n[Test 10] Testing Invalid Product ID / Quantity Validation...");
    const invalidIdRes = await fetchApi("/api/users/cart", {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ productId: "invalid_id", quantity: 1 }),
    });
    if (invalidIdRes.status !== 400) {
      throw new Error(`Expected 400 for invalid ObjectId, got ${invalidIdRes.status}`);
    }

    const nonExistentProduct = new mongoose.Types.ObjectId();
    const nonExistRes = await fetchApi("/api/users/cart", {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ productId: nonExistentProduct.toString(), quantity: 1 }),
    });
    if (nonExistRes.status !== 404) {
      throw new Error(`Expected 404 for non-existent product, got ${nonExistRes.status}`);
    }
    console.log("✓ SUCCESS: Invalid product IDs and non-existent products are safely handled.");

    // Clean up test data
    await User.deleteMany({ email: { $in: [emailA, emailB] } });

    server.close();
    console.log("\nALL PHASE 4 CART & WISHLIST TESTS PASSED SUCCESSFULLY! 🎉\n");
    process.exit(0);
  } catch (err) {
    server.close();
    console.error("❌ Phase 4 Test failed:", err);
    process.exit(1);
  }
}

runPhase4Tests();
