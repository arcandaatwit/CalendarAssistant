import { useState, useRef, useEffect } from "react";
import "./index.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
//simple chat widget for the calendar assistant, with a floating action button to open/close it
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMessages((prev) => [...prev, { role: "assistant", text: "You must be logged in to chat." }]);
      return;
    }

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.error || "Something went wrong." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", text: "Could not reach the chat assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-anchor">
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <span>Calendar Assistant</span>
          </div>

          <div className="chat-message-list" ref={listRef}>
            {messages.length === 0 && (
              <p className="empty-text">Ask about your schedule — "what do I have this week?"</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-message chat-message-${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-message chat-message-assistant chat-message-loading">
                Thinking…
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              className="input-field"
              type="text"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button type="button" className="primary-btn chat-send-btn" onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
