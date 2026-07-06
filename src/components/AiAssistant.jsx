import "../styles/AiAssistant.css";

function AiAssistant({ close }) {
  return (
    <div className="assistant">

      <div className="assistant-header">
        <h3>🤖 SmartCommerce AI</h3>

        <button onClick={close}>✖</button>
      </div>

      <div className="messages">

        <div className="bot-message">
          👋 Hello!
          <br />
          Ask me anything about products.
        </div>

      </div>

      <div className="chat-input">

        <input
          type="text"
          placeholder="Ask AI..."
        />

        <button>Send</button>

      </div>

    </div>
  );
}

export default AiAssistant;