import React from "react";
import { motion } from "motion/react";
import { Terminal, Code, Cpu, Lock, ArrowRight, Copy } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function ForensicAPI() {
  const { t } = useLanguage();
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t("api_copied"));
  };

  return (
    <div className="space-y-32 py-20 pb-40">
      {/* Hero */}
      <div className="max-w-4xl space-y-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-resend-charcoal">{t("api_ecosystem")}</p>
        <h1 className="resend-display-xl !text-5xl md:!text-7xl lg:!text-8xl tracking-tight leading-[0.9]">
          {t("api_hero_title")}
        </h1>
        <p className="text-lg md:text-2xl text-resend-body font-serif leading-relaxed max-w-2xl">
          {t("api_hero_desc")}
        </p>
      </div>

      {/* API Console UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif">{t("api_console_title")}</h3>
            <p className="text-resend-charcoal opacity-60 leading-relaxed text-sm">
              {t("api_console_desc")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-center group cursor-pointer" onClick={() => copyToClipboard("POST https://api.truthlens.ai/v1/analyze")}>
              <div className="w-10 h-10 rounded-lg bg-resend-hairline border border-resend-hairline-strong flex items-center justify-center group-hover:bg-resend-ink group-hover:text-resend-canvas transition-all">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-resend-charcoal mb-1">{t("api_endpoint_label")}</p>
                <p className="text-sm font-mono text-resend-body">api.truthlens.ai/v1/analyze</p>
              </div>
              <Copy className="w-4 h-4 text-resend-hairline-strong group-hover:text-resend-charcoal" />
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-resend-hairline border border-resend-hairline-strong flex items-center justify-center">
                <Lock className="w-4 h-4 text-resend-charcoal" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-resend-charcoal mb-1">{t("api_auth_label")}</p>
                <p className="text-sm text-resend-body">{t("api_auth_desc")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-[#0c0c0c] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <div className="flex gap-1.5 border-r border-white/5 pr-4 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Example Proposal // node.js</span>
            </div>
            <div className="p-8 font-mono text-[13px] leading-relaxed text-white/60 overflow-x-auto">
              <pre>
{`const response = await fetch("https://api.truthlens.ai/v1/analyze", {
  method: "POST",
  headers: {
    "Authorization": "Bearer TL_SEC_XXXXX",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    image: base64_image_data,
    modules: ["metadata", "neural", "sociolinguistic"]
  })
});

const { trustScore, riskLevel } = await response.json();
console.log(\`Analysis Result: \${trustScore}% Authenticity\`);`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-resend-hairline">
        <div className="space-y-4">
          <Cpu className="w-6 h-6 text-resend-charcoal" />
          <h4 className="font-medium">{t("api_feat_1_title")}</h4>
          <p className="text-sm text-resend-charcoal leading-relaxed">{t("api_feat_1_desc")}</p>
        </div>
        <div className="space-y-4">
          <Code className="w-6 h-6 text-resend-charcoal" />
          <h4 className="font-medium">{t("api_feat_2_title")}</h4>
          <p className="text-sm text-resend-charcoal leading-relaxed">{t("api_feat_2_desc")}</p>
        </div>
        <div className="space-y-4">
          <ArrowRight className="w-6 h-6 text-resend-charcoal" />
          <h4 className="font-medium">{t("api_feat_3_title")}</h4>
          <p className="text-sm text-resend-charcoal leading-relaxed">{t("api_feat_3_desc")}</p>
        </div>
      </div>
    </div>
  );
}
