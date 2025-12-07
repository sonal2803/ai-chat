import { useEffect, useState, useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Load chat history
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => {});
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    const res = await fetch(`${BACKEND_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });

    const data = await res.json();
    setMessages(data.messages || []);
    setInput("");
    setLoading(false);
  };

  // Clear UI ONLY (Option B)
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>AI Chat App</h2>
          <button style={styles.clearBtn} onClick={clearChat}>
            Clear Chat
          </button>
        </div>

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <p style={styles.emptyState}>👋 Start a conversation…</p>
        )}

        {/* Chat messages */}
        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              style={{
                ...styles.msgRow,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                animation: "fadeIn .25s ease",
              }}
            >
              {/* Avatar */}
              <div style={styles.avatar}>
                {msg.role === "assistant" ? (
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                  </svg>
                ) : (
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              {/* Bubble */}
              <div
                style={{
                  ...styles.bubble,
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                      : "#1f2937",
                }}
              >
                <div style={styles.name}>
                  {msg.role === "user" ? "You" : "AI"}
                </div>

                <div style={styles.messageText}>{msg.content}</div>

                <div style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing animation */}
          {loading && (
            <div style={styles.typingRow}>
              <div style={styles.typingBubble}>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form style={styles.inputRow} onSubmit={sendMessage}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
          />
          <button style={styles.sendBtn} type="submit" disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

/* ---------------------------------------
   STYLES 
--------------------------------------- */
const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  container: {
    width: "90%",
    maxWidth: "750px",
    height: "90vh",
    background: "#1e293b",
    borderRadius: "18px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 0 25px rgba(0,0,0,0.45)",
    position: "relative",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    background: "linear-gradient(90deg,#60a5fa,#a78bfa)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  clearBtn: {
    padding: "8px 14px",
    background: "#ef4444",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },

  emptyState: {
    color: "#64748b",
    marginTop: "20px",
    textAlign: "center",
    fontSize: "15px",
  },

  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  msgRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  avatar: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  bubble: {
    padding: "14px",
    borderRadius: "12px",
    maxWidth: "70%",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    animation: "fadeIn .25s ease",
  },

  name: {
    fontSize: "13px",
    color: "#93c5fd",
    marginBottom: "5px",
  },

  messageText: {
    whiteSpace: "pre-wrap",
    fontSize: "15px",
    lineHeight: "1.45",
  },

  timestamp: {
    textAlign: "right",
    fontSize: "11px",
    marginTop: "5px",
    color: "#94a3b8",
  },

  typingRow: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "10px",
  },

  typingBubble: {
    background: "#1f2937",
    padding: "10px 14px",
    borderRadius: "12px",
    display: "flex",
    gap: "6px",
    alignItems: "center",
    width: "50px",
    justifyContent: "center",
  },

  dot: {
    width: "6px",
    height: "6px",
    background: "#cbd5e1",
    borderRadius: "50%",
    animation: "typing 1.4s infinite",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #475569",
    background: "#0f172a",
    color: "white",
    transition: "0.2s",
  },

  sendBtn: {
    padding: "12px 18px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
};
