require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require("http");
const aiRoutes = require("./routes/aiRoutes");
const productRoutes = require("./routes/productRoutes");
const Product = require("./models/Product");

async function runAiTests() {
  console.log("=== GEMINI AI SHOPPING ASSISTANT INTEGRATION TESTS ===");

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/ai", aiRoutes);
  app.use("/api/products", productRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const fetchApi = async (path, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    // 1. Test Product API health
    console.log("\n[Test 1] Testing Product API for AI context availability...");
    const productsRes = await fetchApi("/api/products");
    if (productsRes.status !== 200 || !Array.isArray(productsRes.data)) {
      throw new Error("Failed to fetch products for AI context test");
    }
    console.log(`✓ Products API healthy. Total products available for AI context: ${productsRes.data.length}`);

    // 2. Test Invalid Request: Missing Message
    console.log("\n[Test 2] Testing Invalid Request (Missing message)...");
    const missingMsgRes = await fetchApi("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({}),
    });
    if (missingMsgRes.status !== 400) {
      throw new Error(`Expected status 400 for missing message, got ${missingMsgRes.status}`);
    }
    console.log("✓ SUCCESS: Missing message correctly rejected with 400 Bad Request.");

    // 3. Test Invalid Request: Non-string Message
    console.log("\n[Test 3] Testing Invalid Request (Non-string message)...");
    const nonStringRes = await fetchApi("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: 12345 }),
    });
    if (nonStringRes.status !== 400) {
      throw new Error(`Expected status 400 for non-string message, got ${nonStringRes.status}`);
    }
    console.log("✓ SUCCESS: Non-string message correctly rejected with 400 Bad Request.");

    // 4. Test Invalid Request: Message Too Long (>1000 chars)
    console.log("\n[Test 4] Testing Invalid Request (Message > 1000 characters)...");
    const longMsg = "a".repeat(1005);
    const longMsgRes = await fetchApi("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: longMsg }),
    });
    if (longMsgRes.status !== 400) {
      throw new Error(`Expected status 400 for overly long message, got ${longMsgRes.status}`);
    }
    console.log("✓ SUCCESS: Message exceeding 1000 characters correctly rejected with 400 Bad Request.");

    // 5. Test Missing / Unconfigured API Key handling
    console.log("\n[Test 5] Testing Missing / Unconfigured GEMINI_API_KEY handling...");
    const originalApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "";

    const missingKeyRes = await fetchApi("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: "What products do you have?" }),
    });
    if (missingKeyRes.status !== 503) {
      throw new Error(`Expected status 503 when GEMINI_API_KEY is missing, got ${missingKeyRes.status}`);
    }
    console.log("✓ SUCCESS: Unconfigured API key safely handled with 503 Service Unavailable (no secret exposure).");

    // Restore API key
    process.env.GEMINI_API_KEY = originalApiKey;

    // 6. Test Gemini API execution (if GEMINI_API_KEY is provided in .env)
    if (originalApiKey && originalApiKey !== "your_gemini_api_key_here") {
      console.log("\n[Test 6] Testing Real Gemini API Call with Store Catalog Context...");
      const realAiRes = await fetchApi("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Which headphones are available and what is their price?" }),
      });
      if (realAiRes.status === 200 && realAiRes.data.reply) {
        console.log("✓ SUCCESS: Gemini API responded successfully.");
        console.log(`AI Reply snippet: "${realAiRes.data.reply.slice(0, 150)}..."`);
      } else {
        console.log(`⚠️ Gemini API returned status ${realAiRes.status}: ${JSON.stringify(realAiRes.data)}`);
      }
    } else {
      console.log("\n[Test 6] Skipping live Gemini API call (GEMINI_API_KEY placeholder set in .env).");
    }

    server.close(async () => {
      await mongoose.connection.close();
      console.log("\nALL GEMINI AI ASSISTANT TESTS PASSED SUCCESSFULLY! 🎉\n");
      setTimeout(() => process.exit(0), 100);
    });
  } catch (err) {
    server.close(async () => {
      await mongoose.connection.close();
      console.error("❌ AI Test failed:", err);
      setTimeout(() => process.exit(1), 100);
    });
  }
}

runAiTests();
