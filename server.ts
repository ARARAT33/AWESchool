import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI with server-side API Key
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Create data directory if it doesn't exist
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json());

// API route to save user workspace on the server (survives cache clears)
app.post("/api/save-workspace", (req, res) => {
  try {
    const { username, files, folders, selectedFileId, chats, apiKeys } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required to save workspace" });
    }
    
    const key = username.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const filePath = path.join(DATA_DIR, `workspace_${key}.json`);
    
    const payload = {
      username,
      files,
      folders,
      selectedFileId,
      chats,
      apiKeys,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
    res.json({ success: true, message: "Workspace saved successfully on server!" });
  } catch (error: any) {
    console.error("Save workspace error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API route to load user workspace on the server (survives cache clears)
app.get("/api/load-workspace", (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username is required to load workspace" });
    }
    
    const key = (username as string).toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const filePath = path.join(DATA_DIR, `workspace_${key}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return res.json(JSON.parse(data));
    }
    
    res.status(404).json({ error: "Workspace not found for this user" });
  } catch (error: any) {
    console.error("Load workspace error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API route to proxy Gemini requests with Google Search grounding tool
app.post("/api/chat", async (req, res) => {
  try {
    const { systemInstruction, history, prompt, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: { message: "Prompt is required" } });
    }
    if (!apiKey) {
      return res.status(500).json({ 
        error: { 
          message: "GEMINI_API_KEY is not configured on the server. Please add your Gemini API key in Settings > Secrets." 
        } 
      });
    }

    const selectedModel = model || "gemini-3.5-flash";
    
    // Format history according to Gemini content structure
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Call Gemini API using modern @google/genai SDK
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini server proxy error:", error);
    res.status(500).json({ 
      error: { 
        message: error.message || "An error occurred while calling the Gemini API" 
      } 
    });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
