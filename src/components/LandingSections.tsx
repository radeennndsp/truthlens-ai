import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Code2, Terminal, MessageSquare, ShieldCheck, Newspaper, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";

export const DeveloperIntegration = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto mt-32 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="resend-display-xl !text-5xl leading-tight">
            {t("dev_title")} <br />
            <span className="opacity-40">{t("dev_subtitle")}</span>
          </h2>
          <p className="text-resend-charcoal text-lg leading-relaxed max-w-md">
            {t("dev_desc")}
          </p>
          <ul className="space-y-4">
            {[
              t("Dokumentasi API komprehensif"),
              t("Webhooks untuk notifikasi real-time"),
              t("Skalabilitas tanpa batas"),
              t("Keamanan level perusahaan")
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-resend-ink" />
                {item}
              </li>
            ))}
          </ul>
          <button onClick={onNavigate} className="resend-button-primary flex items-center gap-2">
            {t("dev_cta")} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0c0c0c] rounded-2xl border border-white/5 p-1 shadow-2xl">
          <div className="bg-[#0c0c0c] rounded-lg overflow-hidden border border-white/5">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">forensic-api.py</span>
              </div>
            </div>
            <pre className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto">
              <code className="text-zinc-400">
                <span className="text-purple-400">import</span> truthlens_sdk<br /><br />
                client = truthlens_sdk.<span className="text-blue-400">Client</span>(api_key=<span className="text-green-400">"TL_PRO_2026"</span>)<br /><br />
                <span className="text-zinc-500"># Menganalisis bukti digital baru</span><br />
                analysis = client.analyze(<br />
                &nbsp;&nbsp;source=<span className="text-green-400">"whatsapp_leak_01.png"</span>,<br />
                &nbsp;&nbsp;depth=<span className="text-green-400">"pixel_forensics"</span><br />
                )<br /><br />
                <span className="text-purple-400">print</span>(f<span className="text-green-400">"Skor Kepercayaan: {"{analysis.trust_score}"}%"</span>)
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ResourcesGrid = () => {
  const { t } = useLanguage();
  const resources = [
    {
      title: t("Mengenal Manipulasi AI"),
      category: t("Edukasi"),
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
      date: "10 Mei 2026"
    },
    {
      title: t("Efek Deepfake pada Opini Publik"),
      category: t("Riset"),
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      date: "08 Mei 2026"
    },
    {
      title: t("Cara Kerja Forensik Gambar"),
      category: t("Teknis"),
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
      date: "05 Mei 2026"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto mt-48 px-6 pb-32">
      <div className="flex items-baseline justify-between mb-16 border-b border-resend-hairline pb-8">
        <div>
          <h2 className="resend-display-xl !text-4xl mb-4">{t("Wawasan & Sumber Daya.")}</h2>
          <p className="text-resend-charcoal text-sm">{t("Pelajari lebih dalam tentang dunia keamanan informasi digital.")}</p>
        </div>
        <button className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal hover:text-resend-ink transition-colors flex items-center gap-2">
          {t("Lihat Semua")} <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {resources.map((res, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-lg mb-6 border border-resend-hairline-strong">
              <img 
                src={res.image} 
                alt={res.title} 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100" 
              />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-resend-charcoal bg-resend-hairline px-2 py-0.5 rounded">{res.category}</span>
              <span className="text-[9px] font-mono text-resend-charcoal opacity-40">{res.date}</span>
            </div>
            <h3 className="resend-display-xl !text-xl group-hover:text-resend-ink transition-colors">{res.title}</h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const Testimonials = () => {
  const { t } = useLanguage();
  const testimonials = [
    { name: "K. Anderson", role: "Investigative Journalist", text: t("TruthLens mengubah cara kami memverifikasi bukti digital. Hasilnya instan dan sangat akurat."), img: "/images/p1.png" },
    { name: "Prof. Miller", role: "Digital Forensics Expert", text: t("AI yang mereka bangun memahami nuansa manipulasi yang bahkan luput dari mata ahli manusia."), img: "/images/p2.png" },
    { name: "Dand. Putera", role: "OSINT Researcher", text: t("Platform wajib bagi siapa saja yang bekerja di dunia verifikasi informasi dan konten digital."), img: "/images/p3.png" }
  ];

  return (
    <section className="max-w-7xl mx-auto mt-40 px-6 text-center">
      <h3 className="resend-display-xl !text-3xl mb-16 opacity-60">
        {t("test_title")} <br className="hidden md:block" />
        <span className="opacity-100">{t("test_subtitle")}</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
        {testimonials.map((t, i) => (
          <div key={i} className="space-y-6">
            <p className="font-serif text-xl italic leading-relaxed opacity-80">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-resend-hairline border border-resend-hairline-strong overflow-hidden">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest">{t.name}</p>
                <p className="text-[10px] text-resend-charcoal uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export const PricingSection = () => {
  const { t } = useLanguage();
  const plans = [
    {
      name: t("plan_lite"),
      price: "$0",
      desc: t("plan_lite_desc"),
      features: ["5 Scan per hari", "Metadata dasar", "Riwayat 7 hari", "Akses Komunitas"]
    },
    {
      name: t("plan_pro"),
      price: "$29",
      desc: t("plan_pro_desc"),
      features: ["Unlimited Scan", "Deep Neural Analysis", "Laporan PDF Resmi", "Dukungan Prioritas"],
      popular: true
    },
    {
      name: t("plan_enterprise"),
      price: "Custom",
      desc: t("plan_enterprise_desc"),
      features: ["Semua Fitur Pro", "Integrasi API Penuh", "SLA 99.9%", "Dedicated Manager"]
    }
  ];

  return (
    <section id="pricing" className="max-w-7xl mx-auto mt-48 px-6 pb-24 text-center">
      <div className="mb-20">
        <h2 className="resend-display-xl !text-5xl mb-6">{t("pricing_title")}</h2>
        <p className="text-resend-charcoal max-w-md mx-auto">{t("pricing_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "p-12 rounded-3xl border text-left flex flex-col transition-all duration-500",
              plan.popular 
                ? "bg-resend-ink text-resend-canvas border-resend-ink shadow-2xl scale-105" 
                : "bg-resend-hairline border-resend-hairline-strong text-resend-ink"
            )}
          >
            {plan.popular && (
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-resend-canvas text-resend-ink px-3 py-1 rounded-full w-fit mb-6">
                {t("pricing_popular")}
              </span>
            )}
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-serif">{plan.price}</span>
              {plan.price !== "Custom" && <span className="text-sm opacity-60">/bln</span>}
            </div>
            <p className="text-sm mb-10 opacity-70 leading-relaxed">{plan.desc}</p>
            
            <div className="space-y-4 mb-12 flex-1">
              {plan.features.map((feat, j) => (
                <div key={j} className="flex items-center gap-3 text-xs">
                  <Check className={cn("w-4 h-4", plan.popular ? "text-green-400" : "text-resend-charcoal")} />
                  <span className="opacity-80">{t(feat)}</span>
                </div>
              ))}
            </div>

            <button className={cn(
              "w-full py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
              plan.popular 
                ? "bg-resend-canvas text-resend-ink hover:bg-white" 
                : "bg-resend-ink text-resend-canvas hover:opacity-90"
            )}>
              {t("pricing_cta")} {plan.name}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
