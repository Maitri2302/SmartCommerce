import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../utils/api";
import "../styles/AiAssistant.css";

function AiAssistant({ close }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm SmartCommerce AI, your personal shopping assistant. Ask me anything about products, prices, specifications, or recommendations!",
    },
  ]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function askAI() {
    if (!question.trim() || loading) return;

    const trimmedQuestion = question.trim();
    const userMessage = {
      sender: "user",
      text: trimmedQuestion,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setQuestion("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: trimmedQuestion,
          conversation: messages,
        }),
      });

      const aiReply = {
        sender: "bot",
        text: data.reply || "No response received.",
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      const errorReply = {
        sender: "bot",
        text:
          err.message ||
          "Sorry, I ran into an issue answering your question. Please try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Chat reset! How can I assist you with SmartCommerce products today?",
      },
    ]);
  };

  return (
    <div className="assistant">
      <div className="assistant-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3>🤖 SmartCommerce AI</h3>
          <button
            onClick={handleClearChat}
            className="clear-btn"
            title="Clear Chat History"
          >
            🗑️ Clear
          </button>
        </div>
        <button onClick={close} className="close-btn">
          ✖
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === "user"
                ? "user-message"
                : msg.isError
                ? "bot-message bot-error"
                : "bot-message"
            }
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="bot-message bot-loading">
            <span>Thinking... 🤖</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAI();
            }
          }}
          placeholder={loading ? "AI is thinking..." : "Ask AI about products..."}
          disabled={loading}
        />

        <button onClick={askAI} disabled={loading || !question.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default AiAssistant;
