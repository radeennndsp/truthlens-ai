import React, { useState, useRef } from "react";
import {
  Upload,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  BrainCircuit,
  Zap,
  Info,
  Fingerprint,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  File
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { AnalysisResult } from "../types";
import { auth, db } from "../firebase";
import { useTheme } from "../context/ThemeContext";
import { addDoc, collection, serverTimestamp, query, where, getCountFromServer } from "firebase/firestore";
import confetti from "canvas-confetti";
import { ForensicChat } from "./ForensicChat";
import { useLanguage } from "../context/LanguageContext";

const checkScanLimit = async (auth: any, db: any, language: string, t: any) => {
  if (!auth.currentUser) {
    const anonCount = parseInt(localStorage.getItem("truthlens_anon_scans") || "0");
    if (anonCount >= 3) throw new Error(language === 'id' ? "Batas pengecekan gratis habis. Silakan Login." : "Free check limit reached. Please Login.");
  } else {
    try {
      const q = query(collection(db, "scans"), where("userId", "==", auth.currentUser.uid));
      const snapshot = await getCountFromServer(q);
      if (snapshot.data().count >= 3) throw new Error(t("scan_limit_sub"));
    } catch (e: any) {
      if (e.message === t("scan_limit_sub")) throw e;
      console.warn("Failed to check scan limit from Firestore, allowing scan:", e);
    }
  }
};

export default function Scanner() {
  const [scanMode, setScanMode] = useState<'image' | 'document' | 'url'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const { t, language } = useLanguage();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isAnalyzing) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (y - centerY) / 20;
    const tiltY = (centerX - x) / 20;
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupFile(e.target.files[0]);
    }
  };

  const setupFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setResult(null);
    setError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupFile(e.dataTransfer.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => { if (prev >= 90) return prev; return prev + Math.floor(Math.random() * 10); });
    }, 150);

    try {
      // Check Limits
      await checkScanLimit(auth, db, language, t);

      const prefix = preview?.substring(0, 20).toLowerCase();
      if (!preview || !prefix?.startsWith('data:image')) throw new Error("Invalid image data. Please re-upload.");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview.split(',')[1], mimeType: file?.type || 'image/png', language })
      });

      let data: AnalysisResult;
      const ct = response.headers.get("content-type");
      if (ct?.includes("application/json")) {
        data = await response.json();
      } else {
        const txt = await response.text();
        console.error("Non-JSON response:", txt);
        throw new Error("Server error. Please try again.");
      }
      if (!response.ok) throw new Error((data as any).error || "Analysis failed");

      if (!data.emotionalAnalysis) data.emotionalAnalysis = { triggers: [], manipulationType: "Unknown", intensity: 0 };
      if (!data.manipulationDetections) data.manipulationDetections = [];
      if (!data.credibilitySignals) data.credibilitySignals = [];

      setUploadProgress(100);
      clearInterval(progressInterval);
      await new Promise(r => setTimeout(r, 500));
      setResult(data);

      if (data.trustScore > 80) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ffffff', '#3b9eff', '#ff801f'] });

      if (auth.currentUser) {
        await addDoc(collection(db, "scans"), {
          userId: auth.currentUser.uid, timestamp: serverTimestamp(),
          trustScore: data.trustScore, riskLevel: data.riskLevel,
          summary: data.summary, details: data, imageUrl: preview, scanType: 'image'
        });
      } else {
        const c = parseInt(localStorage.getItem("truthlens_anon_scans") || "0");
        localStorage.setItem("truthlens_anon_scans", (c + 1).toString());
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze. Please try again.");
      clearInterval(progressInterval);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDocument = async () => {
    if (!docFile) return;
    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => { if (prev >= 85) return prev; return prev + Math.floor(Math.random() * 8); });
    }, 200);

    try {
      // Check limits
      await checkScanLimit(auth, db, language, t);

      const formData = new FormData();
      formData.append("document", docFile);
      formData.append("language", language);

      const response = await fetch("/api/analyze-doc", { method: "POST", body: formData });

      let data: AnalysisResult;
      const ct = response.headers.get("content-type");
      if (ct?.includes("application/json")) {
        data = await response.json();
      } else {
        const txt = await response.text();
        console.error("Non-JSON response:", txt);
        throw new Error("Server error. Please try again.");
      }
      if (!response.ok) throw new Error((data as any).error || "Document analysis failed");

      if (!data.emotionalAnalysis) data.emotionalAnalysis = { triggers: [], manipulationType: "Unknown", intensity: 0 };
      if (!data.manipulationDetections) data.manipulationDetections = [];
      if (!data.credibilitySignals) data.credibilitySignals = [];

      setUploadProgress(100);
      clearInterval(progressInterval);
      await new Promise(r => setTimeout(r, 500));
      setResult(data);

      if (auth.currentUser) {
        await addDoc(collection(db, "scans"), {
          userId: auth.currentUser.uid, timestamp: serverTimestamp(),
          trustScore: data.trustScore, riskLevel: data.riskLevel,
          summary: data.summary, details: data, scanType: 'document', documentName: docFile.name
        });
      } else {
        const c = parseInt(localStorage.getItem("truthlens_anon_scans") || "0");
        localStorage.setItem("truthlens_anon_scans", (c + 1).toString());
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze document. Please try again.");
      clearInterval(progressInterval);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUrl = async () => {
    if (!urlInput) return setError(language === 'id' ? 'Silakan masukkan URL.' : 'Please enter a URL.');
    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => { if (prev >= 90) return prev; return prev + Math.floor(Math.random() * 10); });
    }, 180);

    try {
      // Check limits
      await checkScanLimit(auth, db, language, t);

      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput, language })
      });

      let data: AnalysisResult;
      const ct = response.headers.get("content-type");
      if (ct?.includes("application/json")) {
        data = await response.json();
      } else {
        const txt = await response.text();
        console.error("Non-JSON response:", txt);
        throw new Error("Server error. Please try again.");
      }
      if (!response.ok) throw new Error((data as any).error || "Analysis failed");

      if (!data.emotionalAnalysis) data.emotionalAnalysis = { triggers: [], manipulationType: "Unknown", intensity: 0 };
      if (!data.manipulationDetections) data.manipulationDetections = [];
      if (!data.credibilitySignals) data.credibilitySignals = [];

      setUploadProgress(100);
      clearInterval(progressInterval);
      await new Promise(r => setTimeout(r, 500));
      setResult(data);

      if (auth.currentUser) {
        await addDoc(collection(db, "scans"), {
          userId: auth.currentUser.uid, timestamp: serverTimestamp(),
          trustScore: data.trustScore, riskLevel: data.riskLevel,
          summary: data.summary, details: data, scanType: 'url', url: urlInput
        });
      } else {
        const c = parseInt(localStorage.getItem("truthlens_anon_scans") || "0");
        localStorage.setItem("truthlens_anon_scans", (c + 1).toString());
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze URL. Please try again.");
      clearInterval(progressInterval);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ perspective: 1000 }}
          >
            {/* ── Mode Tab Toggle ──────────────────────────────────── */}
            <div className="flex items-center gap-1 p-1 bg-resend-hairline rounded-xl mb-4 max-w-xs mx-auto">
              <button
                onClick={() => { setScanMode('image'); setResult(null); setError(null); setDocFile(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                  scanMode === 'image'
                    ? "bg-resend-ink text-resend-canvas shadow-sm"
                    : "text-resend-charcoal hover:text-resend-ink"
                )}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                {language === 'id' ? 'Gambar' : 'Image'}
              </button>
              <button
                onClick={() => { setScanMode('document'); setResult(null); setError(null); setPreview(null); setFile(null); setUrlInput(""); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                  scanMode === 'document'
                    ? "bg-resend-ink text-resend-canvas shadow-sm"
                    : "text-resend-charcoal hover:text-resend-ink"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                {language === 'id' ? 'Dokumen' : 'Document'}
              </button>
              <button
                onClick={() => { setScanMode('url'); setResult(null); setError(null); setPreview(null); setFile(null); setDocFile(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                  scanMode === 'url'
                    ? "bg-resend-ink text-resend-canvas shadow-sm"
                    : "text-resend-charcoal hover:text-resend-ink"
                )}
              >
                <File className="w-3.5 h-3.5" />
                {language === 'id' ? 'URL' : 'URL'}
              </button>
            </div>

            {/* ── Hidden File Inputs ───────────────────────────────── */}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <input ref={docInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => { if (e.target.files?.[0]) { setDocFile(e.target.files[0]); setError(null); } }} />

            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDrop={scanMode === 'image' ? onDrop : (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) { setDocFile(e.dataTransfer.files[0]); setError(null); } }}
              animate={{ rotateX, rotateY }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className={cn(
                "resend-card relative overflow-hidden transition-all duration-500 cursor-pointer min-h-[400px] flex items-center justify-center border-2",
                isDragging
                  ? "border-resend-ink bg-resend-hairline shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                  : (scanMode === 'image' ? preview : docFile)
                    ? "border-resend-hairline-strong bg-black/5 dark:bg-white/5"
                    : "border-dashed border-zinc-300 dark:border-zinc-700 bg-black/10 dark:bg-white/5 hover:border-resend-ink/50"
              )}
              onClick={() => {
                if (isAnalyzing) return;
                if (scanMode === 'image') fileInputRef.current?.click();
                else if (scanMode === 'document') docInputRef.current?.click();
                // don't auto-open anything for URL mode
              }}
            >
              <div className="absolute inset-0 atmospheric-glow-blue opacity-10 pointer-events-none" />

              {/* Technical Corner Accents */}
              {!preview && !docFile && (
                <>
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-400 dark:border-zinc-600" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-400 dark:border-zinc-600" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-400 dark:border-zinc-600" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-400 dark:border-zinc-600" />
                </>
              )}

              {scanMode === 'image' && (
                preview ? (
                  <div className="relative w-full h-full p-2 md:p-4 flex items-center justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-[400px] md:max-h-[600px] w-auto h-auto object-contain rounded-lg shadow-2xl"
                      onError={() => setError("Failed to render preview. Please re-upload.")}
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-resend-canvas/80 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-12">
                        <div className="scanner-beam" />
                        <div className="w-full max-w-xs space-y-8 text-center z-20">
                          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                            <BrainCircuit className="w-12 h-12 text-resend-ink mx-auto" />
                          </motion.div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-resend-charcoal">
                                {uploadProgress < 40 ? "Ingesting Data..." : uploadProgress < 80 ? "Forensic Pass 1..." : uploadProgress < 100 ? "Syncing Neural Result..." : "Finalizing Dossier"}
                              </p>
                              <p className="font-mono text-xs">{uploadProgress}%</p>
                            </div>
                            <div className="h-1 w-full bg-resend-hairline-strong rounded-full overflow-hidden">
                              <motion.div className="h-full bg-resend-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </div>
                          <p className="font-mono text-[9px] tracking-widest uppercase text-resend-charcoal animate-pulse">Node: TruthLens-VN-04 // Heuristic Analysis Active</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center px-6 md:px-12 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white dark:bg-zinc-100 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)] border-2 border-white transition-transform hover:scale-110">
                      <Upload className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    <h3 className="resend-display-xl !text-2xl md:!text-4xl mb-4 tracking-tight">{t("scan_drop_title")}</h3>
                    <p className="text-resend-charcoal text-sm max-w-xs mx-auto opacity-70">{t("scan_drop_subtitle")}</p>
                  </div>
                )
              )}

              {scanMode === 'document' && (
                docFile ? (
                  <div className="flex flex-col items-center justify-center gap-6 p-8">
                    {isAnalyzing ? (
                      <>
                        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                          <BrainCircuit className="w-12 h-12 text-resend-ink" />
                        </motion.div>
                        <div className="w-full max-w-xs space-y-4 text-center">
                          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-resend-charcoal">
                            {uploadProgress < 30 ? "Extracting Text..." : uploadProgress < 60 ? "Cross-referencing Sources..." : uploadProgress < 90 ? "Analyzing Credibility..." : "Finalizing Report..."}
                          </p>
                          <div className="h-1 w-full bg-resend-hairline-strong rounded-full overflow-hidden">
                            <motion.div className="h-full bg-resend-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                          </div>
                          <p className="font-mono text-xs">{uploadProgress}%</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-2xl bg-resend-hairline border border-resend-hairline-strong flex items-center justify-center">
                          <FileText className="w-10 h-10 text-resend-ink" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-resend-ink text-sm truncate max-w-[250px]">{docFile.name}</p>
                          <p className="text-xs text-resend-charcoal mt-1">{(docFile.size / 1024).toFixed(1)} KB · {docFile.name.split('.').pop()?.toUpperCase()}</p>
                        </div>
                        <p className="text-xs text-resend-charcoal opacity-60">{language === 'id' ? 'Klik untuk mengganti dokumen' : 'Click to change document'}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center px-6 md:px-12 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white dark:bg-zinc-100 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)] border-2 border-white transition-transform hover:scale-110">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    <h3 className="resend-display-xl !text-2xl md:!text-4xl mb-4 tracking-tight">{language === 'id' ? 'Unggah Dokumen' : 'Upload Document'}</h3>
                    <p className="text-resend-charcoal text-sm max-w-xs mx-auto opacity-70">{language === 'id' ? 'PDF, Word, atau TXT untuk analisis forensik mendalam' : 'PDF, Word, or TXT for deep forensic analysis'}</p>
                  </div>
                )
              )}

              {scanMode === 'url' && (
                urlInput ? (
                  <div className="flex flex-col items-center justify-center gap-6 p-8">
                    {isAnalyzing ? (
                      <>
                        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                          <BrainCircuit className="w-12 h-12 text-resend-ink" />
                        </motion.div>
                        <div className="w-full max-w-xs space-y-4 text-center">
                          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-resend-charcoal">{uploadProgress < 30 ? "Fetching article..." : uploadProgress < 60 ? "Extracting content..." : uploadProgress < 90 ? "Analyzing credibility..." : "Finalizing report..."}</p>
                          <div className="h-1 w-full bg-resend-hairline-strong rounded-full overflow-hidden">
                            <motion.div className="h-full bg-resend-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                          </div>
                          <p className="font-mono text-xs">{uploadProgress}%</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-2xl bg-resend-hairline border border-resend-hairline-strong flex items-center justify-center">
                          <File className="w-10 h-10 text-resend-ink" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-resend-ink text-sm truncate max-w-[250px]">{urlInput}</p>
                          <p className="text-xs text-resend-charcoal mt-1">{language === 'id' ? 'Analisis artikel web dari URL yang Anda tempel' : 'Analyze a web article from the pasted URL'}</p>
                        </div>
                        <p className="text-xs text-resend-charcoal opacity-60">{language === 'id' ? 'Klik tombol Analisis untuk memulai' : 'Click Analyze to start'}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center px-6 md:px-12 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white dark:bg-zinc-100 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)] border-2 border-white transition-transform hover:scale-110">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    <h3 className="resend-display-xl !text-2xl md:!text-4xl mb-4 tracking-tight">{language === 'id' ? 'Tempel URL Artikel' : 'Paste Article URL'}</h3>
                    <p className="text-resend-charcoal text-sm max-w-xs mx-auto opacity-70">{language === 'id' ? 'Tempel tautan berita atau artikel untuk analisis langsung' : 'Paste a news/article link for immediate analysis'}</p>
                  </div>
                )
              )}
            </motion.div>

            {(scanMode === 'image' && preview || scanMode === 'document' && docFile || scanMode === 'url') && !isAnalyzing && (
              <div className="space-y-4">
                {scanMode === 'url' && (
                  <div className="max-w-xl mx-auto">
                    <input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          analyzeUrl();
                        }
                      }}
                      placeholder={language === 'id' ? 'Tempel URL berita di sini' : 'Paste URL here'}
                      className="w-full p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-resend-hairline"
                    />
                  </div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm max-w-xl mx-auto"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                <div className="flex justify-center gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); setDocFile(null); setUrlInput(""); setError(null); }}
                    className="resend-button-ghost"
                  >
                    {t("scan_btn_clear")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); if (scanMode === 'image') analyzeImage(); else if (scanMode === 'document') analyzeDocument(); else analyzeUrl(); }}
                    className="resend-button-primary flex items-center gap-2 border-2 border-white/50 shadow-lg hover:border-white transition-all"
                  >
                    {t("scan_btn_analyze")} <Fingerprint className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between border-b border-resend-hairline-strong pb-8">
              <button onClick={() => setResult(null)} className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal hover:text-resend-ink flex items-center gap-2">
                <ChevronRight className="w-4 h-4 rotate-180" /> {t("scan_btn_back")}
              </button>
              <div className="text-[11px] font-mono text-resend-charcoal uppercase tracking-widest">{t("scan_dossier_ref")}: {Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Asset Sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                <div className="resend-card overflow-hidden">
                  <div className="p-4 border-b border-resend-hairline-strong bg-resend-hairline flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal">{t("scan_asset_title")}</span>
                    <Maximize2 className="w-3.5 h-3.5 text-resend-charcoal" />
                  </div>
                  {preview || result?.imageUrl ? (
                    <img src={preview || result?.imageUrl} alt="Subject" className={cn("w-full transition-all duration-700", theme === "dark" && "grayscale hover:grayscale-0")} />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-resend-hairline-strong flex flex-col items-center justify-center p-12 text-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-xl">
                        <FileText className="w-10 h-10 text-resend-charcoal" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-resend-ink truncate max-w-full px-4">{result?.url || docFile?.name || 'Document'}</p>
                        <p className="text-[10px] font-mono text-resend-charcoal opacity-60 uppercase mt-1 tracking-tighter">Forensic Source Data</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] font-mono text-resend-charcoal italic">{t("scan_engine_footer")}</p>
                  </div>
                </div>
              </div>

              {/* Main Analysis */}
              <div className="lg:col-span-8 space-y-12">
                {/* Result Header */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      result.riskLevel === 'low' ? "border-green-500/20 text-green-600 dark:text-green-400 bg-green-500/5" : result.riskLevel === 'medium' ? "border-yellow-500/20 text-yellow-600 dark:text-yellow-500 bg-yellow-500/5" : "border-red-500/20 text-red-600 dark:text-red-500 bg-red-500/5"
                    )}>
                      {t("scan_risk")}: {result.riskLevel}
                    </div>
                  </div>
                  <h2 className="resend-display-xl !text-3xl md:!text-5xl leading-tight">{result.summary}</h2>

                  <div className="grid grid-cols-2 lg:flex lg:items-center gap-8 py-8 border-y border-resend-hairline">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal mb-2">{t("scan_trust_score")}</p>
                      <p className="text-3xl md:text-5xl font-serif">{result.trustScore}%</p>
                    </div>
                    <div className="hidden lg:block w-px h-16 bg-resend-hairline-strong" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal mb-2">{t("scan_intent_type")}</p>
                      <p className="text-lg md:text-xl font-medium">{result.emotionalAnalysis?.manipulationType || t("scan_unknown")}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="resend-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <ShieldAlert className="w-4 h-4 text-resend-charcoal" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal">Tool Artifacts</h4>
                    </div>
                    <div className="space-y-4">
                      {(result.manipulationDetections || []).map((m, i) => (
                        <div key={i} className="flex gap-4 p-4 border border-resend-hairline-strong rounded-lg bg-resend-hairline">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-1" />
                          <div>
                            <p className="text-sm font-medium mb-1">{m.type}</p>
                            <p className="text-xs text-resend-charcoal leading-relaxed">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="resend-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <BrainCircuit className="w-4 h-4 text-resend-charcoal" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal">Sociolinguistics</h4>
                    </div>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {(result.emotionalAnalysis?.triggers || []).map((t, i) => (
                          <span key={i} className="px-2 py-1 rounded border border-resend-hairline-strong text-[10px] font-mono text-resend-charcoal uppercase">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-resend-hairline">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal">Emotional Power</span>
                          <span className="text-xs font-mono">{result.emotionalAnalysis?.intensity || 0}/10</span>
                        </div>
                        <div className="h-0.5 w-full bg-resend-hairline">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(result.emotionalAnalysis?.intensity || 0) * 10}%` }}
                            className="h-full bg-resend-charcoal"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="resend-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-4 h-4 text-resend-charcoal" />
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal">Verified Dimensions</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {(result.credibilitySignals || []).map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-resend-charcoal">
                        <div className="w-1 h-1 rounded-full bg-resend-charcoal mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.extractedText && (
                  <div className="resend-card p-8 bg-resend-hairline">
                    <div className="flex items-center gap-3 mb-6">
                      <Info className="w-4 h-4 text-resend-charcoal" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal">OCR Output</h4>
                    </div>
                    <p className="font-mono text-xs text-resend-charcoal whitespace-pre-wrap leading-loose">
                      {result.extractedText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && <ForensicChat result={result} />}
    </div>
  );
}
