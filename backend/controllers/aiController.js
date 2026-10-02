const { GoogleGenAI } = require("@google/genai");
const Product = require("../models/Product");

/**
 * Helper to build product context string from MongoDB.
 */
const getProductContext = async () => {
  try {
    const products = await Product.find({}).lean();
    if (!products || products.length === 0) {
      return "No products are currently available in the SmartCommerce database catalog.";
    }

    return products
      .map((p, index) => {
        const ratingStr = p.rating
          ? `${p.rating} / 5 (${p.numReviews || p.reviews || 0} reviews)`
          : "No reviews yet";
        const stockStr =
          p.countInStock !== undefined
            ? `${p.countInStock} units in stock`
            : p.stock !== undefined
            ? `${p.stock} units in stock`
            : "In stock";
        const desc = p.description || "No description provided.";
        return `${index + 1}. Product: "${p.name}"
   - ID: ${p.productId || p._id}
   - Category: ${p.category}
   - Price: ₹${p.price}
   - Rating: ${ratingStr}
   - Stock: ${stockStr}
   - Description: ${desc}`;
      })
      .join("\n\n");
  } catch (err) {
    console.error("Failed to load product context for AI:", err.message);
    return "Error loading product catalog context from database.";
  }
};

/**
 * Controller for AI Shopping Assistant
 * @route POST /api/ai/chat
 * @access Public
 */
const handleAiChat = async (req, res) => {
  try {
    const { message, conversation } = req.body;

    // 1. Validation: message exists, is string, reasonable length
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please provide a valid message string.",
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        message: "Message is too long. Maximum allowed length is 1000 characters.",
      });
    }

    // 2. Check GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (
      !apiKey ||
      apiKey.trim() === "" ||
      apiKey === "your_gemini_api_key_here"
    ) {
      return res.status(503).json({
        message:
          "Gemini AI assistant is unavailable because GEMINI_API_KEY is not configured in backend/.env.",
      });
    }

    // 3. Fetch Product Catalog Context from MongoDB
    const catalogContext = await getProductContext();

    // 4. Construct System Instruction & History
    const systemInstruction = `You are SmartCommerce AI, an intelligent e-commerce shopping assistant for the SmartCommerce online store.
Your goal is to help shoppers find products, compare options, understand specifications, check pricing, ratings, and availability in our catalog.

SMARTCOMMERCE STORE CATALOG:
${catalogContext}

STRICT GUIDELINES:
1. TRUTHFULNESS: You MUST ONLY refer to products, prices, ratings, review counts, stock, and details that exist in the SMARTCOMMERCE STORE CATALOG above.
2. NO HALLUCINATION: Never invent or fabricate products, prices, specifications, or ratings that are not in the catalog.
3. ABSENT PRODUCTS: If a user asks for a product category or item not listed in the catalog, inform them politely that SmartCommerce does not currently offer it.
4. TONE: Be helpful, friendly, concise, and professional. Format list responses clearly using markdown bullet points.
5. CURRENCY: Always list prices in Indian Rupees (₹).`;

    // 5. Call Gemini API via @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });

    let promptText = message.trim();
    if (Array.isArray(conversation) && conversation.length > 0) {
      const historySummary = conversation
        .slice(-6)
        .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      promptText = `Previous Conversation:\n${historySummary}\n\nCurrent User Question: ${message.trim()}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    const reply =
      response.text ||
      "I'm sorry, I couldn't generate a response at the moment.";

    return res.status(200).json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error("Gemini AI Chat Controller Error:", error.message || error);
    return res.status(500).json({
      message:
        "Failed to communicate with the Gemini AI service. Please try again later.",
    });
  }
};

module.exports = { handleAiChat };
