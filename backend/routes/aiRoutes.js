const express = require("express");
const router = express.Router();
const { handleAiChat } = require("../controllers/aiController");

// POST /api/ai/chat
router.post("/chat", handleAiChat);

module.exports = router;
