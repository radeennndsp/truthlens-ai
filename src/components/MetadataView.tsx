import React from "react";
import { motion } from "motion/react";
import { X, FileCode, Hash, Database, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface MetadataViewProps {
  onClose: () => void;
  filename?: string;
}

export default function MetadataView({ onClose, filename = "EVIDENCE_ASSET_442" }: MetadataViewProps) {
  const { t } = useLanguage();
  const metadata = [
    { label: "File Format", value: "PNG Image (MIME: image/png)" },
    { label: "Dimensions", value: "1170 x 2532 px" },
    { label: "Color Space", value: "sRGB IEC61966-2.1" },
    { label: "Bits Per Component", value: "8 bits" },
    { label: "Software Signature", value: "Apple iOS 17.4.1 (iPhone 14 Pro)" },
    { label: "Created Date", value: "2026-05-10 12:44:12 UTC" },
    { label: "EXIF Original", value: "Preserved" },
    { label: "ICC Profile", value: "Display P3" },
    { label: "GPS Data", value: "Sanitized/Obfuscated" },
    { label: "Forensic Hash (SHA-256)", value: "ec3ba4b0ff8c8e104193b08e70fb90956f..." },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden"
    >
      <div className="max-w-2xl w-full resend-card bg-resend-canvas p-6 md:p-12 relative border-resend-hairline-strong max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-resend-charcoal opacity-40 hover:text-resend-ink transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-resend-hairline pb-8">
            <FileCode className="w-6 h-6 text-resend-charcoal opacity-60" />
            <div>
              <h3 className="text-xl font-serif">{t("dos_meta_title")}</h3>
              <p className="text-[10px] font-mono text-resend-charcoal opacity-40 uppercase tracking-widest">{filename}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {metadata.map((item, i) => (
              <div key={i} className="flex justify-between items-baseline border-b border-resend-hairline pb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal opacity-40">{item.label}</span>
                <span className="text-xs font-mono text-resend-charcoal opacity-80">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-resend-hairline rounded border border-resend-hairline-strong flex gap-4 items-center">
            <Hash className="w-4 h-4 text-resend-charcoal opacity-40" />
            <p className="text-[10px] font-mono text-resend-charcoal opacity-60 truncate">
              DETECTION_SIGNATURE: TRUTHLENS_V3_NEURAL_8822_X9
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
