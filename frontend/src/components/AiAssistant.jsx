import { useState } from "react";
import "../styles/AiAssistant.css";

function AiAssistant({ close }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm SmartCommerce AI. Ask me anything about products.",
    },
  ]);

  async function askAI() {
    if (!question.trim()) return;

    const userMessage = {
      sender: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Temporary AI reply
    const aiReply = {
      sender: "bot",
      text: `You asked: "${question}". Gemini API integration is coming next.`,
    };

    setMessages((prev) => [...prev, aiReply]);

    setQuestion("");
  }

  return (
    <div className="assistant">
      <div className="assistant-header">
        <h3>🤖 SmartCommerce AI</h3>

        <button onClick={close}>✖</button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? "user-message" : "bot-message"}
          >
            {msg.text}
          </div>
        ))}
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
          placeholder="Ask AI..."
        />

        <button onClick={askAI}>Send</button>
      </div>
    </div>
  );
}

export default AiAssistant;
