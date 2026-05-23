import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { createRequire } from "module";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin SDK initialized successfully");
  } else {
    // In Cloud Run or other managed environments, use application default credentials
    admin.initializeApp();
    console.log("✅ Firebase Admin SDK initialized using Application Default Credentials");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error);
}

// Multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// API Rate Limiter to protect Gemini Quota
const analysisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { error: "Terlalu banyak permintaan analisis. Silakan coba lagi dalam 10 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTPs are now stored in Firestore instead of memory for stateless scaling

const createMailTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const getForgotPasswordEmailHtml = (code: string, recipientEmail: string): string => {
  // Split OTP into individual digit boxes
  const digitBoxes = code.split('').map(d =>
    `<td style="padding:0 4px;">` +
    `<table cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td style="width:48px;height:64px;background-color:#1c1c1f;border:1px solid #2f2f36;border-top:2px solid #3b9eff;border-radius:8px;text-align:center;vertical-align:middle;">` +
    `<span style="font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:700;color:#ffffff;letter-spacing:0;display:block;line-height:64px;">${d}</span>` +
    `</td></tr></table></td>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>TruthLens — Kode Verifikasi Keamanan</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0c;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0c;">
    <tr>
      <td align="center" style="padding:56px 16px 48px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- ═══ LOGO HEADER ═══ -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Logo Image -->
                  <td style="padding-right:12px;vertical-align:middle;">
                    <img src="cid:truthlenslogo" alt="TruthLens Logo" width="36" height="36" style="display:block; border-radius:8px;" />
                  </td>
                  <!-- Wordmark -->
                  <td style="vertical-align:middle;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.08em;text-transform:uppercase;">TRUTH</span><span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#a1a4a5;letter-spacing:0.08em;text-transform:uppercase;">LENS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ MAIN CARD ═══ -->
          <tr>
            <td style="background-color:#121215;border:1px solid #28282e;border-radius:12px;overflow:hidden;">

              <!-- Accent top bar — Forensic Blue -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="height:3px;background-color:#3b9eff;"></td></tr>
              </table>

              <!-- ─ CARD BODY ─ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:40px 44px 36px 44px;">

                    <!-- Status Badge -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="background-color:#0b1e36;border:1px solid #3b9eff;border-radius:9999px;padding:5px 14px;">
                          <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;color:#54aeff;letter-spacing:0.18em;text-transform:uppercase;">Permintaan Keamanan</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Heading -->
                    <h1 style="margin:0 0 10px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;line-height:1.3;">Reset Kata Sandi</h1>

                    <!-- Body text -->
                    <p style="margin:0 0 32px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#ced1d6;">
                      Permintaan reset kata sandi diterima untuk akun dengan alamat email&nbsp;<span style="color:#ffffff;font-weight:600;">${recipientEmail}</span>.<br/>Gunakan kode di bawah ini untuk melanjutkan proses.
                    </p>

                    <!-- Hairline divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                      <tr><td style="height:1px;background-color:#2a2a30;"></td></tr>
                    </table>

                    <!-- OTP Label -->
                    <p style="margin:0 0 14px 0;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:0.22em;color:#9ca3af;text-transform:uppercase;">Kode Verifikasi</p>

                    <!-- OTP Digit Boxes -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>${digitBoxes}</tr>
                    </table>

                    <!-- Expiry notice -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                      <tr>
                        <td style="background-color:#18181c;border:1px solid #2f2f36;border-radius:8px;padding:12px 16px;">
                          <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#a1a4aa;">Kode berlaku selama&nbsp;<strong style="color:#e5e7eb;font-weight:600;">5 menit</strong>&nbsp;sejak email ini diterima.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Hairline divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr><td style="height:1px;background-color:#2a2a30;"></td></tr>
                    </table>

                    <!-- Security Note — Blue left border -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-left:3px solid #3b9eff;padding:2px 0 2px 16px;">
                          <p style="margin:0 0 6px 0;font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:#54aeff;letter-spacing:0.18em;text-transform:uppercase;">Catatan Keamanan</p>
                          <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#a1a4a5;">Jangan bagikan kode ini kepada siapa pun, termasuk tim TruthLens. Jika Anda tidak meminta reset kata sandi, abaikan email ini &mdash; kata sandi Anda tetap aman.</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ─ CARD FOOTER ─ -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#0e0e11;border-top:1px solid #2a2a30;padding:16px 44px;">
                    <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:#888a8f;line-height:1.7;">
                      Email otomatis dari TruthLens AI &mdash; mohon tidak dibalas.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ═══ BOTTOM CAPTION ═══ -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:12px;"><span style="display:inline-block;width:20px;height:1px;background-color:#333333;vertical-align:middle;"></span></td>
                  <td><span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#777777;letter-spacing:0.2em;text-transform:uppercase;">&copy; ${new Date().getFullYear()} TruthLens AI &middot; Digital Forensic Platform</span></td>
                  <td style="padding-left:12px;"><span style="display:inline-block;width:20px;height:1px;background-color:#333333;vertical-align:middle;"></span></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};


const sendForgotPasswordOtpEmail = async (email: string, code: string) => {
  const transporter = createMailTransport();
  const from = process.env.EMAIL_FROM || `TruthLens <${process.env.SMTP_USER}>`;
  const subject = "TruthLens \u2013 Kode Verifikasi Reset Kata Sandi";
  const text = `Kode OTP reset kata sandi TruthLens Anda: ${code}\n\nKode berlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.\n\nJika Anda tidak meminta reset kata sandi, abaikan email ini.`;
  const html = getForgotPasswordEmailHtml(code, email);
  
  await transporter.sendMail({ 
    from, 
    to: email, 
    subject, 
    text, 
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, 'public', 'logo.png'),
        cid: 'truthlenslogo' // referenced in the html as src="cid:truthlenslogo"
      }
    ]
  });
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust proxy is required for Cloud Run to pass client IP to rate limiter
  app.set('trust proxy', 1);

  // Security Headers & CORS
  app.use(helmet({
    contentSecurityPolicy: false, // Set to false if using Vite dev server or specific CDN assets
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }));
  if (process.env.NODE_ENV !== "production") {
    app.use(cors()); // Only allow CORS in dev. In prod, frontend and API share same origin.
  }

  // Body size limits for high-res images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Request Logger
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const isApi = req.url.startsWith("/api");
      const isError = res.statusCode >= 400;
      const duration = Date.now() - start;
      let color = "\x1b[90m"; // grey for static
      if (isError) color = "\x1b[31m"; // red
      else if (isApi) color = "\x1b[32m"; // green
      console.log(`${new Date().toLocaleTimeString()} | ${color}${req.method} ${req.url} - ${res.statusCode}\x1b[0m [${duration}ms]`);
    });
    next();
  });

  // ─── Health Check ─────────────────────────────────────────────────────────
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Forgot Password OTP Flow ─────────────────────────────────────────────
  app.post("/api/forgot-password/send", async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email diperlukan." });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      
      if (admin.apps.length === 0) {
        return res.status(500).json({ error: "Firebase Admin SDK belum dikonfigurasi di server." });
      }
      
      await admin.firestore().collection("otps").doc(normalizedEmail).set({ code, expiresAt, attempts: 0 });
      await sendForgotPasswordOtpEmail(normalizedEmail, code);
      res.json({ message: "OTP telah dikirim ke email Anda.", expiresAt });
    } catch (error: any) {
      console.error("❌ Forgot Password OTP send error:", error?.message || error);
      res.status(500).json({ error: error?.message || "Gagal mengirim OTP. Periksa konfigurasi email." });
    }
  });

  app.post("/api/forgot-password/verify", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body as { email?: string; code?: string };
      if (!email || typeof email !== "string" || !code || typeof code !== "string") {
        return res.status(400).json({ error: "Email dan kode OTP diperlukan." });
      }
      if (admin.apps.length === 0) {
        return res.status(500).json({ error: "Firebase Admin SDK belum dikonfigurasi di server." });
      }
      
      const normalizedEmail = email.trim().toLowerCase();
      const docRef = admin.firestore().collection("otps").doc(normalizedEmail);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return res.status(400).json({ error: "Kode OTP tidak valid atau sudah kadaluwarsa." });
      }
      
      const stored = docSnap.data() as { code: string; expiresAt: number; attempts: number };
      if (Date.now() > stored.expiresAt) {
        await docRef.delete();
        return res.status(400).json({ error: "Kode OTP telah kedaluwarsa." });
      }
      if (stored.code !== code.trim()) {
        const attempts = stored.attempts + 1;
        if (attempts >= 5) {
          await docRef.delete();
        } else {
          await docRef.update({ attempts });
        }
        return res.status(400).json({ error: "Kode OTP tidak valid." });
      }
      
      await docRef.update({ verified: true });
      res.json({ success: true });
    } catch (error: any) {
      console.error("❌ Forgot Password OTP verify error:", error?.message || error);
      res.status(500).json({ error: error?.message || "Gagal memverifikasi kode OTP." });
    }
  });

  app.post("/api/forgot-password/reset", async (req: Request, res: Response) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || typeof email !== "string" || !code || typeof code !== "string" || !newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ error: "Email, OTP, dan sandi baru diperlukan." });
      }

      if (admin.apps.length === 0) {
        return res.status(500).json({ error: "Firebase Admin SDK belum dikonfigurasi di server." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const docRef = admin.firestore().collection("otps").doc(normalizedEmail);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return res.status(400).json({ error: "Sesi OTP tidak valid atau kedaluwarsa. Silakan ulangi." });
      }
      
      const stored = docSnap.data() as { code: string; expiresAt: number; verified?: boolean };
      if (stored.code !== code.trim() || Date.now() > stored.expiresAt || !stored.verified) {
        return res.status(400).json({ error: "Sesi OTP tidak valid atau kedaluwarsa. Silakan ulangi." });
      }

      await docRef.delete();
      const userRecord = await admin.auth().getUserByEmail(normalizedEmail);
      await admin.auth().updateUser(userRecord.uid, { password: newPassword });

      res.json({ success: true, message: "Kata sandi berhasil diatur ulang." });
    } catch (error: any) {
      console.error("❌ Forgot Password Reset error:", error?.message || error);
      res.status(500).json({ error: error?.message || "Gagal mereset kata sandi." });
    }
  });
  // ─── Get Client IP ────────────────────────────────────────────────────────
  app.get("/api/my-ip", (req: Request, res: Response) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
    res.json({ ip: ip || "Unknown" });
  });

  // ─── Image Analysis ───────────────────────────────────────────────────────
  app.post("/api/analyze", analysisLimiter, async (req: Request, res: Response) => {
    console.log("📸 Image Analyze Request Received");
    try {
      const { image, mimeType, language } = req.body as any;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) return res.status(500).json({ error: "Gemini API key not configured" });
      if (!image) return res.status(400).json({ error: "No image data provided" });

      const prompt = `
        You are TruthLens AI, an expert digital forensic analyst.
        Analyze this screenshot for digital manipulation, misinformation, and emotional manipulation.
        
        IMPORTANT: Respond entirely in ${language === "id" ? "Indonesian (Bahasa Indonesia)" : "English"} language.
        
        Return ONLY valid JSON with this exact structure:
        {
          "trustScore": number (0-100),
          "riskLevel": "low" | "medium" | "high",
          "summary": string,
          "manipulationDetections": [{ "type": string, "description": string, "confidence": number }],
          "emotionalAnalysis": { "triggers": string[], "manipulationType": string, "intensity": number },
          "extractedText": string,
          "credibilitySignals": string[]
        }
        
        Check for: UI inconsistencies, timestamp anomalies, emotional manipulation (fear/rage bait), fake UI patterns (WhatsApp, Instagram, Banking), and missing context.
      `;

      const genAI = new GoogleGenAI({ apiKey });
      const result: any = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ parts: [{ text: prompt }, { inlineData: { data: image, mimeType } }] }],
        config: { responseMimeType: "application/json" },
      });

      const rawText = result.response?.text || result.text || "";
      if (!rawText) throw new Error("AI returned an empty response");

      const cleanJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error("❌ Image Analysis Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Document Analysis ────────────────────────────────────────────────────
  app.post("/api/analyze-doc", analysisLimiter, upload.single("document"), async (req: Request, res: Response) => {
    console.log("📄 Document Analyze Request Received:", req.file?.originalname);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Gemini API key not configured" });
      if (!req.file) return res.status(400).json({ error: "No document uploaded" });

      const { language } = req.body;
      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();
      let extractedText = "";

      // Extract text based on file type
      if (ext === ".pdf") {
        const _require = createRequire(import.meta.url);
        const _pdfMod = _require("pdf-parse");
        const _pdf = _pdfMod.default || _pdfMod;
        const pdfData = await _pdf(file.buffer);
        extractedText = pdfData.text;
      } else if (ext === ".docx" || ext === ".doc") {
        const _require = createRequire(import.meta.url);
        const _mamMod = _require("mammoth");
        const _mam = _mamMod.default || _mamMod;
        const result = await _mam.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } else if (ext === ".txt") {
        extractedText = file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload PDF, DOCX, or TXT." });
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ error: "Could not extract text from document. File may be empty or image-based PDF." });
      }

      const prompt = `
        You are TruthLens AI, an expert forensic document analyst and fact-checker.
        Analyze the following document text for authenticity, credibility, source analysis, and potential manipulation.
        
        IMPORTANT: Respond entirely in ${language === "id" ? "Indonesian (Bahasa Indonesia)" : "English"} language.
        
        Document Name: ${file.originalname}
        Document Content:
        ---
        ${extractedText.substring(0, 15000)}
        ---
        
        Perform a comprehensive forensic analysis and return ONLY valid JSON with this exact structure:
        {
          "trustScore": number (0-100, based on credibility and authenticity),
          "riskLevel": "low" | "medium" | "high",
          "summary": string (2-3 sentences comprehensive overview of findings),
          "manipulationDetections": [{ "type": string, "description": string, "confidence": number }],
          "emotionalAnalysis": {
            "triggers": string[],
            "manipulationType": string (e.g., "fear mongering", "appeal to authority", "none detected"),
            "intensity": number (0-10)
          },
          "credibilitySignals": string[],
          "documentFindings": {
            "sourceCredibility": string (analysis of likely source/origin),
            "authorAnalysis": string (writing style, expertise level, consistency),
            "claimsVerification": string[] (list of key claims that need verification),
            "plagiarismIndicators": string[] (signs of copied or unoriginal content),
            "writingStyle": string (academic/journalistic/informal/propaganda analysis),
            "recommendedActions": string[] (what the reader should do to verify)
          }
        }
        
        Be thorough, precise, and professional. Base your analysis strictly on the document content provided.
      `;

      const genAI = new GoogleGenAI({ apiKey });
      const result: any = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const rawText = result.response?.text || result.text || "";
      if (!rawText) throw new Error("AI returned an empty response");

      const cleanJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      parsed.scanType = "document";
      parsed.documentName = file.originalname;
      parsed.extractedText = extractedText.substring(0, 800) + (extractedText.length > 800 ? "..." : "");
      res.json(parsed);
    } catch (error: any) {
      console.error("❌ Document Analysis Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ─── URL / Web Article Analysis ───────────────────────────────────────────
  app.post("/api/analyze-url", analysisLimiter, async (req: Request, res: Response) => {
    console.log("🔗 URL Analyze Request Received:", req.body?.url);
    try {
      const { url, language } = req.body as any;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Gemini API key not configured" });
      if (!url) return res.status(400).json({ error: "No URL provided" });

      // Fetch page HTML
      const resp = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; TruthLensBot/1.0)" } });
      if (!resp.ok) return res.status(400).json({ error: `Failed to fetch URL: ${resp.statusText}` });
      const html = await resp.text();

      // Extract main article text using jsdom + Readability
      const _require = createRequire(import.meta.url);
      const jsdomMod = _require("jsdom");
      const ReadabilityMod = _require("@mozilla/readability");
      const { JSDOM } = jsdomMod;
      const { Readability } = ReadabilityMod;

      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      const articleText = (article && article.textContent) ? article.textContent : dom.window.document.body.textContent || "";

      const resolveSrc = (src?: string) => {
        if (!src) return undefined;
        const candidate = src.split(',')[0].trim().split(' ')[0];
        try {
          return new URL(candidate, url).toString();
        } catch {
          return undefined;
        }
      };

      const getMeta = (propName: string) => {
        const el = dom.window.document.querySelector(`meta[property='${propName}'], meta[name='${propName}']`);
        return el?.getAttribute('content') || undefined;
      };

      const getImageFromElement = (el: Element | null) => {
        if (!el) return undefined;
        const src = (el.getAttribute('src') || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('data-original'))?.trim();
        if (src) return resolveSrc(src);
        const srcset = el.getAttribute('srcset');
        return resolveSrc(srcset || undefined);
      };

      let imageUrl = getMeta('og:image') || getMeta('twitter:image') || getMeta('og:image:secure_url') || getMeta('og:image:url') || getMeta('twitter:image:src') || getMeta('image');
      if (!imageUrl) {
        const linkImage = dom.window.document.querySelector("link[rel='image_src']");
        imageUrl = getImageFromElement(linkImage as Element) || undefined;
      }
      if (!imageUrl) {
        const candidates = dom.window.document.querySelectorAll('article img, .article img, .content img, .post img, .entry img, img');
        for (const imgEl of Array.from(candidates)) {
          const candidate = getImageFromElement(imgEl as any);
          if (candidate) {
            imageUrl = candidate;
            break;
          }
        }
      }

      if (!articleText || articleText.trim().length < 50) {
        return res.status(400).json({ error: "Could not extract substantial article text from the provided URL." });
      }

      const snippet = articleText.substring(0, 15000);

      const prompt = `
        You are TruthLens AI, an expert web article forensic analyst and fact-checker.
        Analyze the following article text for authenticity, credibility, source analysis, and potential manipulation.
        IMPORTANT: Respond entirely in ${language === "id" ? "Indonesian (Bahasa Indonesia)" : "English"} language.

        Source URL: ${url}
        Article Content:
        ---
        ${snippet}
        ---

        Perform a comprehensive forensic analysis and return ONLY valid JSON with this exact structure:
        {
          "trustScore": number (0-100),
          "riskLevel": "low" | "medium" | "high",
          "summary": string,
          "manipulationDetections": [{ "type": string, "description": string, "confidence": number }],
          "emotionalAnalysis": { "triggers": string[], "manipulationType": string, "intensity": number },
          "credibilitySignals": string[]
        }

        Be thorough, precise, and professional. Base your analysis strictly on the article content provided.
      `;

      const genAI = new GoogleGenAI({ apiKey });
      const result: any = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const rawText = result.response?.text || result.text || "";
      if (!rawText) throw new Error("AI returned an empty response");

      const cleanJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      parsed.scanType = "url";
      parsed.url = url;
      parsed.imageUrl = imageUrl;
      parsed.extractedText = articleText.substring(0, 800) + (articleText.length > 800 ? "..." : "");
      res.json(parsed);
    } catch (error: any) {
      console.error("❌ URL Analysis Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Forensic Chat ────────────────────────────────────────────────────────
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages, context, language } = req.body as any;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Gemini API key not configured" });

      const genAI = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are the TruthLens Forensic Intelligence AI.
Your role is to help users understand complex forensic analysis reports of digital evidence.
IMPORTANT: Communicate entirely in ${language === "id" ? "Indonesian (Bahasa Indonesia)" : "English"}.
Use plain text without markdown formatting. Do not use **bold**, *italics*, backticks, or code blocks unless explicitly requested.
Do not repeat raw JSON or technical metadata dumps in the answer.
Current Analysis Context: ${JSON.stringify(context, null, 2)}`;

      const result: any = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          ...messages.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] })),
        ],
      });

      const text = result.response?.text || result.text || "";
      res.json({ text });
    } catch (error: any) {
      console.error("❌ Chat Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Vite Dev / Static Prod ───────────────────────────────────────────────
  // ─── Production Serving ───────────────────────────────────────────────────
  const isProd = process.env.NODE_ENV === "production";
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get("*", (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[32m✓ TruthLens AI running on http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[90m  → Image Analysis: POST /api/analyze\x1b[0m`);
    console.log(`\x1b[90m  → Document Analysis: POST /api/analyze-doc\x1b[0m`);
    console.log(`\x1b[90m  → Forensic Chat: POST /api/chat\x1b[0m`);
  });
}

startServer();
