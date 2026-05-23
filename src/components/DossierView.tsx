import React from "react";
import { 
  X, 
  Download, 
  ShieldCheck, 
  Fingerprint, 
  Clock, 
  FileText,
  Share2,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserScan } from "../types";
import { cn } from "../lib/utils";
import MetadataView from "./MetadataView";
import { ForensicChat } from "./ForensicChat";
import { useLanguage } from "../context/LanguageContext";

interface DossierViewProps {
  scan: UserScan;
  onClose: () => void;
}

export default function DossierView({ scan, onClose }: DossierViewProps) {
  const [showMetadata, setShowMetadata] = React.useState(false);
  const { t } = useLanguage();
  
  if (!scan) return null;
  const result = scan.details || { 
    summary: scan.summary || "No summary available", 
    trustScore: scan.trustScore || 0,
    riskLevel: scan.riskLevel || "low",
    manipulationDetections: [],
    credibilitySignals: [],
    emotionalAnalysis: { triggers: [], manipulationType: "Unknown", intensity: 0 }
  };
  
  const handleExport = () => {
    // We add a print-only style in index.css to format this nicely
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'TruthLens Forensic Report',
      text: `Investigation Report for File: ${scan.id.slice(0, 8)}\nTrust Score: ${result.trustScore}%\nSummary: ${result.summary}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert(t("link_copied") || "Report details copied to clipboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dossier-print-container fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 print:p-0 print:bg-white print:block print:absolute print:inset-0"
    >
      <AnimatePresence>
        {showMetadata && (
          <MetadataView onClose={() => setShowMetadata(false)} filename={scan.id.slice(0, 8)} />
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto resend-card bg-resend-canvas border-resend-hairline-strong relative print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full print:max-w-none">
        <motion.button 
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-8 right-8 text-resend-charcoal hover:text-resend-ink transition-colors p-2 z-10 print:hidden"
        >
          <X className="w-6 h-6" />
        </motion.button>

        <div className="p-6 md:p-12 lg:p-20 space-y-12 md:space-y-16 print:p-8 print:space-y-10">
          {/* Header */}
          <div className="space-y-6 border-b border-resend-hairline pb-12 md:pb-16 mt-8 md:mt-0 print:pb-8 print:border-black/20 print:break-inside-avoid">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-resend-hairline-strong flex items-center justify-center print:border-black">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-resend-charcoal print:text-black" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-resend-charcoal print:text-black">{t("dos_official_report")}</p>
                <p className="text-[11px] font-mono text-resend-charcoal opacity-60 print:opacity-100 print:text-black">FILE NO: {scan.id.toUpperCase()}</p>
              </div>
            </div>
            
            <h2 className="resend-display-xl !text-4xl md:!text-6xl tracking-tighter leading-tight print:text-black">
              {result.summary}
            </h2>
            
            <div className="flex flex-wrap gap-4 md:gap-8 pt-4 md:pt-8">
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-resend-charcoal opacity-40 print:text-black" />
                <span className="text-[11px] font-medium text-resend-charcoal opacity-60 print:opacity-100 print:text-black">
                  {scan.timestamp?.toDate ? scan.timestamp.toDate().toLocaleString() : 'Aug 24, 2026'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Fingerprint className="w-3.5 h-3.5 text-resend-charcoal opacity-40 print:text-black" />
                <span className="text-[11px] font-mono text-resend-charcoal opacity-60 print:opacity-100 print:text-black">HASH: 0x{scan.id.slice(0, 12).toUpperCase()}...</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 print:flex print:flex-col print:gap-10">
            {/* Visual Evidence */}
            <div className="space-y-10 print:space-y-8">
              <div className="space-y-4 print:break-inside-avoid">
                <div className="resend-card overflow-hidden bg-resend-hairline print:border print:border-black/20 print:bg-white print:max-w-[400px]">
                  {scan.imageUrl ? (
                    <img src={scan.imageUrl} alt="Evidence" className="w-full h-auto grayscale print:object-contain" />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-resend-hairline-strong flex flex-col items-center justify-center p-12 text-center gap-4 print:bg-white">
                      <FileText className="w-12 h-12 text-resend-charcoal opacity-40 print:text-black" />
                      <p className="text-[10px] font-mono text-resend-charcoal opacity-60 uppercase tracking-widest print:text-black">Document Evidence</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="resend-card p-8 bg-resend-hairline/50 print:bg-white print:border print:border-black/20 print:break-inside-avoid">
                <h4 className="text-sm font-bold uppercase tracking-widest text-resend-charcoal opacity-80 mb-6 print:text-black">{t("dos_credibility")}</h4>
                <div className="space-y-4">
                  {(result.credibilitySignals || []).map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm text-resend-body items-start print:text-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-resend-charcoal opacity-30 mt-2 shrink-0 print:bg-black" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis Data */}
            <div className="space-y-12 print:space-y-10">
              <div className="grid grid-cols-2 gap-8 print:flex print:gap-8 print:break-inside-avoid">
                <div className="p-8 resend-card bg-resend-hairline/50 print:bg-white print:border print:border-black/20 print:flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal opacity-60 mb-2 print:text-black">{t("dos_confidence")}</p>
                  <p className="text-5xl font-serif print:text-black">{result.trustScore}%</p>
                </div>
                <div className={cn(
                  "p-8 resend-card print:bg-white print:border print:flex-1",
                  result.riskLevel === 'high' ? "bg-red-500/10 border-red-500/20 print:border-black/20" : "bg-green-500/10 border-green-500/20 print:border-black/20"
                )}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal opacity-60 mb-2 print:text-black">{t("dos_classification")}</p>
                  <p className={cn(
                    "text-2xl font-bold uppercase tracking-tighter print:text-black",
                    result.riskLevel === 'high' ? "text-red-600 dark:text-red-500" : "text-green-600 dark:text-green-500"
                  )}>{result.riskLevel}</p>
                </div>
              </div>

              <div className="space-y-6 print:break-inside-avoid">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal opacity-60 print:text-black">{t("dos_anomalies")}</h4>
                <div className="space-y-4">
                  {(result.manipulationDetections || []).map((det, i) => (
                    <div key={i} className="p-6 border border-resend-hairline-strong rounded-xl bg-resend-hairline print:bg-white print:border-black/20 print:break-inside-avoid">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-resend-ink opacity-80 print:text-black">{det.type}</span>
                        <span className="text-[10px] font-mono text-resend-charcoal opacity-60 print:text-black">{(det.confidence * 100).toFixed(0)}% Match</span>
                      </div>
                      <p className="text-sm text-resend-charcoal opacity-70 leading-relaxed print:text-black print:opacity-100">{det.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 print:break-inside-avoid">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal opacity-60 print:text-black">{t("dos_transcript")}</h4>
                <div className="p-8 resend-card bg-resend-hairline font-mono text-xs text-resend-charcoal opacity-60 leading-loose print:bg-white print:border print:border-black/20 print:text-black print:opacity-100">
                  {result.extractedText || "No textual data extracted from subject."}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-16 border-t border-resend-hairline print:hidden">
            <button 
              onClick={handleExport}
              className="resend-button-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> {t("dos_btn_export")}
            </button>
            <button onClick={handleShare} className="resend-button-ghost flex items-center gap-2">
              <Share2 className="w-4 h-4" /> {t("dos_btn_share")}
            </button>
            <button 
              onClick={() => setShowMetadata(true)}
              className="resend-button-ghost flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> {t("dos_btn_metadata")}
            </button>
          </div>
        </div>
      </div>
      
      <div className="print:hidden">
        <ForensicChat result={result} />
      </div>
    </motion.div>
  );
}
