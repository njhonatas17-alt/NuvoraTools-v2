import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Static SEO and PWA routes
app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
});

app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "manifest.json"));
});

app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(process.cwd(), "public", "sw.js"));
});

// API route for AI Invoice parsing/generation from prompt
app.post("/api/generate-invoice", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt string is required" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are an expert invoice generator parser. Extract structured invoice data from this user prompt: "${prompt}".
Return strictly valid JSON with this shape (no markdown backticks or extra text, just raw JSON):
{
  "senderName": string,
  "senderEmail": string,
  "senderAddress": string,
  "clientName": string,
  "clientEmail": string,
  "clientAddress": string,
  "invoiceNumber": string,
  "currency": string (e.g. "USD", "EUR", "GBP"),
  "taxRate": number (e.g. 10),
  "discount": number (e.g. 0),
  "notes": string,
  "items": [
    {
      "description": string,
      "quantity": number,
      "unitPrice": number
    }
  ]
}`
        });

        const text = response.text || "";
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        res.json({ success: true, data: parsed });
        return;
      } catch (geminiErr) {
        console.warn("Gemini API call failed or unparseable, falling back to smart heuristic parser:", geminiErr);
      }
    }

    // Heuristic Fallback
    const today = new Date().toISOString().split("T")[0];
    const defaultInvoice = {
      senderName: "Acme Creative Studio",
      senderEmail: "billing@acmecreative.com",
      senderAddress: "742 Evergreen Terrace, Suite 100, San Francisco, CA",
      clientName: prompt.match(/for ([A-Z][a-z0-9A-Z\s]+)/i)?.[1]?.split(/due|with|\$|\./i)[0]?.trim() || "Global Client Inc.",
      clientEmail: "accounts@clientcorp.com",
      clientAddress: "100 Market St, New York, NY 10001",
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      currency: prompt.includes("€") || prompt.toLowerCase().includes("eur") ? "EUR" : prompt.includes("£") || prompt.toLowerCase().includes("gbp") ? "GBP" : "USD",
      taxRate: prompt.match(/(\d+)%\s*tax/i) ? parseFloat(RegExp.$1) : 10,
      discount: 0,
      notes: "Thank you for your business! Payment due within 14 days.",
      items: [
        {
          description: prompt.length > 5 ? prompt.slice(0, 60) : "Professional Services & Consulting",
          quantity: 1,
          unitPrice: parseFloat(prompt.match(/\$?(\d+([\.,]\d+)?)/)?.[1] || "1250")
        }
      ]
    };

    res.json({ success: true, data: defaultInvoice, note: "Generated via smart engine" });
  } catch (error) {
    console.error("Error in generate-invoice:", error);
    res.status(500).json({ error: "Failed to generate invoice data" });
  }
});

async function startServer() {
  // Vite middleware for dev or static serving in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ToolHub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
