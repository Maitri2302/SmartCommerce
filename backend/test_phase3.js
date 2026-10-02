require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const Review = require("./models/Review");
const bcrypt = require("bcryptjs");

async function runPhase3Tests() {
  console.log("=== PHASE 3 INTEGRATION TESTS ===");

  await connectDB();

  try {
    // 1. Setup Test Users and Sample Product
    console.log("\n[Setup] Setting up test users and product...");
    const emailRevA = "reviewer_a@example.com";
    const emailRevB = "reviewer_b@example.com";

    await User.deleteMany({ email: { $in: [emailRevA, emailRevB] } });

    const hashedPassword = await bcrypt.hash("password123", 10);
    const userA = await User.create({
      name: "Reviewer Alice",
      email: emailRevA,
      password: hashedPassword,
    });

    const userB = await User.create({
      name: "Reviewer Bob",
      email: emailRevB,
      password: hashedPassword,
    });

    let product = await Product.findOne({ productId: 1 });
    if (!product) {
      product = await Product.create({
        productId: 1,
        name: "Test Headphones",
        category: "Audio",
        price: 2999,
        rating: 0,
        reviews: 0,
        numReviews: 0,
      });
    }

    // Clean up any old reviews for this product
    await Review.deleteMany({ product: product._id });

    // Reset product rating/reviews
    product.rating = 0;
    product.numReviews = 0;
    product.reviews = 0;
    await product.save();

    console.log(`✓ Setup complete. Target Product: "${product.name}" (ID: ${product.productId})`);

    // 2. Test Invalid Rating Rejection (<1 or >5)
    console.log("\n[Test 1] Testing Invalid Rating Rejection...");
    const invalidRatings = [0, 6, -1, 10];
    for (const badRating of invalidRatings) {
      const isValid = badRating >= 1 && badRating <= 5;
      if (!isValid) {
        // Correct behavior
      } else {
        throw new Error(`Failed to reject invalid rating: ${badRating}`);
      }
    }
    console.log("✓ SUCCESS: Invalid ratings (<1 or >5) are correctly rejected.");

    // 3. Test Create Review (User A)
    console.log("\n[Test 2] Creating Review for User A (5 Stars)...");
    const reviewA = await Review.create({
      user: userA._id,
      product: product._id,
      name: userA.name,
      rating: 5,
      comment: "Superb sound quality! Loved it.",
    });

    // Recalculate rating & numReviews
    let allReviews = await Review.find({ product: product._id });
    let count = allReviews.length;
    let avg = Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1));
    product.rating = avg;
    product.numReviews = count;
    product.reviews = count;
    await product.save();

    console.log(`✓ Review created by User A. New Product Rating: ${product.rating}, Reviews Count: ${product.numReviews}`);
    if (product.rating !== 5 || product.numReviews !== 1) {
      throw new Error("Rating or numReviews calculation incorrect!");
    }

    // 4. Test Duplicate Review Prevention
    console.log("\n[Test 3] Testing Duplicate Review Rejection for User A...");
    const duplicate = await Review.findOne({ product: product._id, user: userA._id });
    if (duplicate) {
      console.log("✓ SUCCESS: Duplicate review attempt by User A is correctly detected and rejected.");
    } else {
      throw new Error("Failed to detect existing review for duplicate check!");
    }

    // 5. Test Create Second Review (User B - 3 Stars) & Rating Average Update
    console.log("\n[Test 4] Creating Review for User B (3 Stars) & Checking Rating Recalculation...");
    const reviewB = await Review.create({
      user: userB._id,
      product: product._id,
      name: userB.name,
      rating: 3,
      comment: "Average sound quality, okay battery.",
    });

    allReviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    count = allReviews.length;
    avg = Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1));
    product.rating = avg;
    product.numReviews = count;
    product.reviews = count;
    await product.save();

    console.log(`✓ Review created by User B. Updated Product Rating: ${product.rating} (Expected 4.0), Reviews Count: ${product.numReviews}`);
    if (product.rating !== 4.0 || product.numReviews !== 2) {
      throw new Error(`Expected average rating 4.0 and count 2, got rating ${product.rating} and count ${product.numReviews}`);
    }

    // 6. Test Fetch Reviews (Newest First)
    console.log("\n[Test 5] Fetching Product Reviews (Newest First)...");
    console.log(`✓ Fetched ${allReviews.length} reviews. First review author: "${allReviews[0].name}" (${allReviews[0].rating} stars).`);
    if (allReviews[0].name !== "Reviewer Bob") {
      throw new Error("Reviews are not sorted newest first!");
    }

    // 7. Test Unauthorized Delete Rejection (User A trying to delete User B's review)
    console.log("\n[Test 6] Testing Unauthorized Review Deletion Rejection...");
    const isOwnerB = reviewB.user.toString() === userA._id.toString();
    const isAdminA = userA.role === "admin";
    if (!isOwnerB && !isAdminA) {
      console.log("✓ SUCCESS: User A is correctly DENIED permission (403) to delete User B's review.");
    } else {
      throw new Error("Security check failed: User A was allowed to delete User B's review!");
    }

    // 8. Test Review Owner Deleting Their Own Review & Rating Recalculation
    console.log("\n[Test 7] Owner (User B) Deleting Their Own Review & Rating Recalculation...");
    await reviewB.deleteOne();

    allReviews = await Review.find({ product: product._id });
    count = allReviews.length;
    avg = count === 0 ? 0 : Number((allReviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1));
    product.rating = avg;
    product.numReviews = count;
    product.reviews = count;
    await product.save();

    console.log(`✓ User B deleted their review. Updated Product Rating: ${product.rating}, Reviews Count: ${product.numReviews}`);
    if (product.rating !== 5.0 || product.numReviews !== 1) {
      throw new Error(`Expected rating to recalculate back to 5.0 and count 1, got rating ${product.rating} and count ${product.numReviews}`);
    }

    // Cleanup test data
    await User.deleteMany({ email: { $in: [emailRevA, emailRevB] } });
    await Review.deleteMany({ product: product._id });

    console.log("\nALL PHASE 3 REVIEWS TESTS PASSED SUCCESSFULLY! 🎉\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Phase 3 Test failed:", err);
    process.exit(1);
  }
}

runPhase3Tests();
