import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { fileURLToPath } from "url";

dotenv.config();
console.log("Loaded ENV KEY:", process.env.GROQ_API_KEY);

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Chat Backend is running!");
});

const PORT = process.env.PORT || 5000;
const CHAT_FILE = path.join(__dirname, "chatHistory.json");

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* --------------------------- LOAD MESSAGES --------------------------- */
function loadMessages() {
  try {
    const data = fs.readFileSync(CHAT_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/* --------------------------- SAVE MESSAGES --------------------------- */
function saveMessages(messages) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2));
}

/* --------------------------- GET HISTORY --------------------------- */
app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  res.json({ messages });
});

/* --------------------------- DELETE HISTORY (optional) --------------------------- */
app.delete("/api/messages", (req, res) => {
  // Frontend doesn't call this now, but keeping it doesn't hurt
  saveMessages([]);
  res.json({ success: true, messages: [] });
});

/* --------------------------- POST MESSAGE --------------------------- */
app.post("/api/messages", async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: "Message content required" });
  }

  let messages = loadMessages();

  // USER message object
  const userMsg = {
    id: Date.now() + "-user",
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
  messages.push(userMsg);

  /* ------------------- FORMAT MESSAGES FOR GROQ ------------------- */
  const formattedMessages = [
    {
      role: "system",
      content: "You are a helpful AI assistant in an AI chat application.",
    },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  /* ------------------------ GROQ CALL ------------------------ */
  let aiReply = "Sorry, I could not generate a response.";

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
      max_tokens: 300,
    });

    aiReply =
      completion.choices?.[0]?.message?.content || "No response.";
  } catch (error) {
    console.error("Groq API Error:", error);
  }

  /* ----------------------- AI MESSAGE ------------------------ */
  const aiMsg = {
    id: Date.now() + "-assistant",
    role: "assistant",
    content: aiReply,
    timestamp: new Date().toISOString(),
  };

  messages.push(aiMsg);
  saveMessages(messages);

  res.json({ messages });
});

/* --------------------------- START SERVER --------------------------- */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
