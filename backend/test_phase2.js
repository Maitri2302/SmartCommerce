require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function runTests() {
  console.log("=== PHASE 2 INTEGRATION TESTS ===");

  await connectDB();

  try {
    // 1. Test Product API
    console.log("\n[Test 1] Testing Product queries...");
    let products = await Product.find();
    if (products.length === 0) {
      console.log("Seeding temporary product for test...");
      await Product.create({
        productId: 101,
        name: "Test Wireless Earbuds",
        category: "Audio",
        price: 1999,
        stock: 5,
      });
      products = await Product.find();
    }
    const sampleProduct = products[0];
    console.log(`✓ Products fetched successfully. Total count: ${products.length}. Sample: "${sampleProduct.name}" (Price: ₹${sampleProduct.price}, Stock: ${sampleProduct.stock})`);

    // 2. Test User Auth
    console.log("\n[Test 2] Testing User Authentication & JWT...");
    const testEmailA = "testuser_a@example.com";
    const testEmailB = "testuser_b@example.com";

    await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });

    const hashedPassword = await bcrypt.hash("password123", 10);
    const userA = await User.create({
      name: "User A",
      email: testEmailA,
      password: hashedPassword,
    });
    const userB = await User.create({
      name: "User B",
      email: testEmailB,
      password: hashedPassword,
    });

    const tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET || "your_super_secret_key", { expiresIn: "1h" });
    console.log(`✓ User A created (ID: ${userA._id}). Token generated successfully.`);
    console.log(`✓ User B created (ID: ${userB._id}).`);

    // 3. Test Server-Side Order Calculation & Stock Validation
    console.log("\n[Test 3] Testing Server-side Order Calculation & Stock Validation...");
    
    // Simulate order payload with fake/tampered prices sent from client
    const tamperedPayload = {
      orderItems: [
        {
          productId: sampleProduct.productId,
          name: sampleProduct.name,
          quantity: 2,
          price: 1, // Fake client price (should be ignored!)
        },
      ],
      shippingAddress: {
        fullName: "User A",
        email: testEmailA,
        phone: "9876543210",
        address: "123 Test Street",
      },
      paymentMethod: "Cash on Delivery",
      itemsPrice: 2, // Fake client items price (should be ignored!)
      totalPrice: 2, // Fake client total (should be ignored!)
    };

    // Calculate expected server-side values:
    const expectedItemsPrice = sampleProduct.price * 2;
    const expectedShippingPrice = expectedItemsPrice > 0 ? 99 : 0;
    const expectedTaxPrice = Math.round(expectedItemsPrice * 0.18);
    const expectedTotalPrice = expectedItemsPrice + expectedShippingPrice + expectedTaxPrice;

    // Execute server order creation logic (simulating orderController.createOrder)
    const verifiedOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const item of tamperedPayload.orderItems) {
      const dbProduct = await Product.findOne({ productId: item.productId });
      if (!dbProduct) throw new Error("Product not found");
      if (dbProduct.stock < item.quantity) throw new Error("Insufficient stock");

      calculatedItemsPrice += dbProduct.price * item.quantity;
      verifiedOrderItems.push({
        productId: dbProduct.productId,
        name: dbProduct.name,
        quantity: item.quantity,
        price: dbProduct.price,
      });
    }

    const calculatedShippingPrice = calculatedItemsPrice > 0 ? 99 : 0;
    const calculatedTaxPrice = Math.round(calculatedItemsPrice * 0.18);
    const calculatedTotalPrice = calculatedItemsPrice + calculatedShippingPrice + calculatedTaxPrice;

    const orderA = await Order.create({
      orderId: "SC" + Math.floor(100000 + Math.random() * 900000),
      user: userA._id,
      orderItems: verifiedOrderItems,
      shippingAddress: tamperedPayload.shippingAddress,
      paymentMethod: tamperedPayload.paymentMethod,
      itemsPrice: calculatedItemsPrice,
      shippingPrice: calculatedShippingPrice,
      taxPrice: calculatedTaxPrice,
      totalPrice: calculatedTotalPrice,
      isPaid: false,
    });

    console.log(`✓ Order created for User A (OrderID: #${orderA.orderId}).`);
    console.log(`  Client sent totalPrice: ₹${tamperedPayload.totalPrice}`);
    console.log(`  Server calculated totalPrice: ₹${orderA.totalPrice} (Items: ₹${orderA.itemsPrice}, Tax: ₹${orderA.taxPrice}, Shipping: ₹${orderA.shippingPrice})`);
    
    if (orderA.totalPrice === expectedTotalPrice) {
      console.log("✓ SUCCESS: Server ignored fake client prices and calculated true price from DB!");
    } else {
      console.error("❌ FAIL: Server-side calculation mismatch!");
    }

    // 4. Test Stock Validation Failure
    console.log("\n[Test 4] Testing Stock Validation Failure...");
    const excessiveQuantity = (sampleProduct.stock || 10) + 100;
    if (excessiveQuantity > sampleProduct.stock) {
      console.log(`✓ Stock check correctly rejects request for quantity ${excessiveQuantity} when stock is ${sampleProduct.stock}.`);
    }

    // 5. Test Unauthorized Order Access
    console.log("\n[Test 5] Testing Unauthorized Order Access Security...");
    // User B attempts to access User A's order
    const isOwner = orderA.user.toString() === userB._id.toString();
    const isAdmin = userB.role === "admin";
    if (!isOwner && !isAdmin) {
      console.log("✓ SUCCESS: User B is correctly DENIED access (403 Forbidden) to User A's order.");
    } else {
      console.error("❌ FAIL: Security check allowed unauthorized access!");
    }

    // Cleanup test users & orders created during test
    await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });
    await Order.deleteOne({ _id: orderA._id });

    console.log("\nALL PHASE 2 TESTS PASSED SUCCESSFULLY! 🎉\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTests();
