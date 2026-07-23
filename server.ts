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
    const { prompt, language = "en" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt string is required" });
      return;
    }

    const langCode = String(language).toLowerCase();
    const isPt = langCode === "pt" || langCode === "pt-br";

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const langInstruction = isPt 
          ? "CRITICAL: The user interface language is Portuguese (pt). All item descriptions, notes, terms, and default labels MUST be written in Portuguese."
          : `CRITICAL: The user interface language is ${language}. Write item descriptions, notes, and terms in this language.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `You are an expert financial invoice parser. Parse the following billing request into structured invoice fields.
Prompt: "${prompt}"

Requirements:
1. Extract clientName, clientEmail (if any), clientAddress (if any).
2. Extract senderName, senderEmail (if any), senderAddress (if any).
3. Extract currency: Use standard ISO code ("USD", "EUR", "GBP", "BRL", "CAD", "AUD", "JPY", "INR").
   - "R$" or "BRL" or "reais" or "real" -> "BRL"
   - "€" or "EUR" or "euro" -> "EUR"
   - "£" or "GBP" or "pound" -> "GBP"
   - "$" or "USD" -> "USD"
4. Extract taxRate (number, e.g. 10 for 10% tax, default 0 if not mentioned).
5. Extract discount (number, e.g. 5 for 5% discount, default 0 if not mentioned).
6. Extract invoice items: array of objects { description: string, quantity: number, unitPrice: number }.
   - If user says "18 hours React Development at $80/hour", items should be [{ description: "${isPt ? 'Desenvolvimento React' : 'React Development'}", quantity: 18, unitPrice: 80 }].
   - If user says "$2500 for Nursing Services" or "R$3500 por Desenvolvimento Web", items should be [{ description: "...", quantity: 1, unitPrice: 2500 }].
7. Extract dates if mentioned (e.g. "due in 14 days", "vencimento em 14 dias", "due 2026-08-20"). Return ISO date strings YYYY-MM-DD for invoiceDate (today) and dueDate.
8. ${langInstruction}

Return strictly a valid raw JSON object matching this schema (NO markdown formatting, NO code blocks, NO text outside JSON):
{
  "senderName": string,
  "senderEmail": string,
  "senderAddress": string,
  "clientName": string,
  "clientEmail": string,
  "clientAddress": string,
  "invoiceNumber": string,
  "invoiceDate": string,
  "dueDate": string,
  "currency": string,
  "taxRate": number,
  "discount": number,
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
        console.warn("Gemini API call failed or unparseable, falling back to smart heuristic engine:", geminiErr);
      }
    }

    // Comprehensive Heuristic Fallback Engine
    const parsedData = parseInvoicePromptHeuristic(prompt, langCode);
    res.json({ success: true, data: parsedData, note: "Generated via smart heuristic engine" });
  } catch (error) {
    console.error("Error in generate-invoice:", error);
    res.status(500).json({ error: "Failed to generate invoice data" });
  }
});

// Smart Heuristic Parser for Invoice Prompts
function parseInvoicePromptHeuristic(prompt: string, lang: string = "en") {
  const pLower = prompt.toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];
  const isPt = lang === "pt" || lang === "pt-br";

  // 1. Currency Detection
  let currency = isPt ? "BRL" : "USD";
  if (prompt.includes("R$") || pLower.includes("brl") || pLower.includes("reais") || pLower.includes("real")) {
    currency = "BRL";
  } else if (prompt.includes("€") || pLower.includes("eur") || pLower.includes("euro")) {
    currency = "EUR";
  } else if (prompt.includes("£") || pLower.includes("gbp") || pLower.includes("pound")) {
    currency = "GBP";
  } else if (prompt.includes("CA$") || pLower.includes("cad")) {
    currency = "CAD";
  } else if (prompt.includes("A$") || pLower.includes("aud")) {
    currency = "AUD";
  } else if (prompt.includes("¥") || pLower.includes("jpy") || pLower.includes("yen")) {
    currency = "JPY";
  } else if (prompt.includes("₹") || pLower.includes("inr") || pLower.includes("rupee")) {
    currency = "INR";
  }

  // 2. Client Name Extraction
  // Patterns like: "Invoice John Smith...", "Bill Maria Silva...", "Invoice Acme Ltd...", "Invoice Carlos for...", "Invoice ABC Company €1200..."
  let clientName = "";
  const clientMatch = prompt.match(/(?:invoice|bill|facture|faturar|fatura)\s+([A-Z0-9\u00C0-\u00FF][A-Za-z0-9\u00C0-\u00FF\s&\.\-']+?)(?=\s+(?:for|por|para|with|com|at|due|vencimento|\$|R\$|€|£|R\b|\d+|hours?|horas?|hrs?|website|logo|marketing|nursing|dev|\b[A-Z0-9\$\u20AC\u00A3]|\d{2,}))/i)
    || prompt.match(/(?:invoice|bill|facture|faturar|fatura)\s+([A-Z0-9\u00C0-\u00FF][A-Za-z0-9\u00C0-\u00FF\s&\.\-']+)/i);

  if (clientMatch && clientMatch[1]) {
    clientName = clientMatch[1].trim()
      .replace(/^(for|to|with|due|por|para|com)\s+/i, "")
      .replace(/\s+(for|with|due|at|por|para|com)$/i, "");
  }
  if (!clientName || clientName.length < 2) {
    clientName = isPt ? "Cliente Especial" : "Valued Client";
  }

  // 3. Tax Extraction
  let taxRate = 0;
  const taxMatch = prompt.match(/(\d+(?:\.\d+)?)%\s*(?:tax|imposto|vat|gst|iss)/i) || prompt.match(/(?:with|com)\s+(\d+(?:\.\d+)?)%\s*(?:tax|imposto|iss)/i);
  if (taxMatch) {
    taxRate = parseFloat(taxMatch[1]) || 0;
  }

  // 4. Discount Extraction
  let discount = 0;
  const discountMatch = prompt.match(/(\d+(?:\.\d+)?)%\s*(?:discount|desconto)/i);
  if (discountMatch) {
    discount = parseFloat(discountMatch[1]) || 0;
  }

  // 5. Due Date Calculation
  let dueDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const daysMatch = prompt.match(/(?:due\s+in|vencimento\s+em|vence\s+em)\s+(\d+)\s+(?:days|dias)/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    dueDateStr = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  } else {
    const isoDateMatch = prompt.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) {
      dueDateStr = isoDateMatch[1];
    }
  }

  // 6. Item Description, Quantity & Unit Price Extraction
  let items: Array<{ description: string; quantity: number; unitPrice: number }> = [];

  const hourlyMatch = prompt.match(/(\d+)\s*(?:hours?|horas?|hrs?|days?|dias?|units?|unidades?)\s+(.*?)\s+(?:at|por|a)\s+[\$R\$€£]?(\d+(?:\.\d+)?)/i);
  if (hourlyMatch) {
    const qty = parseInt(hourlyMatch[1], 10) || 1;
    let desc = hourlyMatch[2].trim().replace(/^(de|of)\s+/i, "");
    const price = parseFloat(hourlyMatch[3]) || 0;
    if (desc) {
      items.push({ description: desc, quantity: qty, unitPrice: price });
    }
  }

  if (items.length === 0) {
    const priceMatch = prompt.match(/(?:[\$€£]|R\$)\s*(\d+(?:[\.,]\d+)?)/) || prompt.match(/(\d+(?:[\.,]\d+)?)\s*(?:USD|EUR|GBP|BRL|dollars|reais|euros)/i);
    let extractedPrice = 100;
    if (priceMatch) {
      extractedPrice = parseFloat(priceMatch[1].replace(",", ".")) || 100;
    }

    let desc = "";
    const forMatch = prompt.match(/\b(?:for|por|para)\s+([^$%€£\d]+?)(?=\s+(?:with|com|at|due|vencimento|tax|imposto|\$|R\$|€|£|\d+|$))/i);
    if (forMatch && forMatch[1]) {
      desc = forMatch[1].trim();
    } else {
      desc = prompt
        .replace(/(?:invoice|bill|facture|faturar|fatura)/gi, "")
        .replace(new RegExp(clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), "")
        .replace(/(?:[\$€£]|R\$)\s*\d+(?:[\.,]\d+)?/g, "")
        .replace(/\d+\s*(?:USD|EUR|GBP|BRL|dollars|reais|euros)/gi, "")
        .replace(/(?:with|com)\s+\d+%\s*(?:tax|imposto|iss)/gi, "")
        .replace(/\b(for|por|para|at|due|vencimento|in|em|days|dias|with|com)\b/gi, "")
        .trim();
    }

    if (!desc || desc.length < 2) {
      desc = isPt ? "Serviços Profissionais" : "Professional Services";
    }

    desc = desc.replace(/^[\s,.\-:]+|[\s,.\-:]+$/g, '');

    items.push({
      description: desc.charAt(0).toUpperCase() + desc.slice(1),
      quantity: 1,
      unitPrice: extractedPrice
    });
  }

  return {
    senderName: isPt ? "Nuvora Estúdio" : "Nuvora Studio",
    senderEmail: "billing@nuvoratools.com",
    senderAddress: isPt ? "Av. Paulista, 1000, São Paulo, SP 01310-100" : "100 Tech Plaza, San Francisco, CA 94105",
    clientName,
    clientEmail: `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@cliente.com`,
    clientAddress: isPt ? "Endereço do Cliente" : "Client Address Line",
    invoiceNumber: `FAT-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: todayStr,
    dueDate: dueDateStr,
    currency,
    taxRate,
    discount,
    notes: isPt ? "Pagamento a ser efetuado até a data de vencimento. Agradecemos a preferência!" : "Payment due upon receipt. Thank you for your business!",
    items
  };
}

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
