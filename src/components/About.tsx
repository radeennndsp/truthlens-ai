import { Shield, Cpu, Globe, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";
import { Counter } from "./Counter";
import { useLanguage } from "../context/LanguageContext";

interface AboutProps {
  onStart?: () => void;
}

export default function About({ onStart }: AboutProps) {
  const { t } = useLanguage();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-32 py-20 pb-40">
      {/* Hero Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl space-y-12"
      >
        <motion.p variants={item} className="text-[10px] font-bold uppercase tracking-[0.4em] text-resend-charcoal">
          Neural-Engine Forensics
        </motion.p>
        <motion.h1 variants={item} className="resend-display-xl !text-5xl md:!text-7xl lg:!text-8xl tracking-tight leading-[0.9]">
          {t("about_hero_title_1")} <br />
          <span className="opacity-40">{t("about_hero_title_2")}</span>
        </motion.h1>
        <motion.p variants={item} className="text-xl md:text-2xl text-resend-body font-serif leading-relaxed max-w-2xl">
          {t("about_hero_desc")}
        </motion.p>
      </motion.div>

      {/* Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 border-t border-resend-hairline pt-20">
        <div className="space-y-8">
          <h2 className="text-3xl font-serif">{t("about_philosophy_title")}</h2>
          <p className="text-resend-body leading-loose">
            {t("about_philosophy_desc")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {[
            { label: "Neural Analysis", value: 99.8, suffix: "%", decimals: 1 },
            { label: "Latency", value: 2.4, prefix: "<", suffix: "s", decimals: 1 },
            { label: "Detections", value: 14, suffix: "k+", decimals: 0 },
            { label: "Regions", value: "Global", sub: "Coverage" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="resend-card p-4 md:p-6"
            >
              <p className="text-[10px] uppercase font-bold text-resend-charcoal mb-4">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-serif mb-1">
                {typeof stat.value === "number" ? (
                  <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} decimals={stat.decimals} />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-[10px] text-resend-charcoal uppercase tracking-widest">{stat.sub || (stat.label === "Neural Analysis" ? "Accuracy" : stat.label === "Latency" ? "Processing" : "Daily")}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="space-y-16">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-resend-hairline" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-resend-charcoal">{t("about_pillar_title")}</h3>
          <div className="h-px flex-1 bg-resend-hairline" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: <Cpu className="w-5 h-5" />,
              title: t("about_pillar_1_title"),
              desc: t("about_pillar_1_desc")
            },
            {
              icon: <BrainCircuit className="w-5 h-5" />,
              title: t("about_pillar_2_title"),
              desc: t("about_pillar_2_desc")
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: t("about_pillar_3_title"),
              desc: t("about_pillar_3_desc")
            }
          ].map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 group"
            >
              <div className="w-12 h-12 rounded-full border border-resend-hairline-strong flex items-center justify-center text-resend-charcoal group-hover:bg-resend-ink group-hover:text-resend-canvas transition-all duration-500">
                {pillar.icon}
              </div>
              <h4 className="text-xl font-medium">{pillar.title}</h4>
              <p className="text-sm text-resend-charcoal leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Call */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.01 }}
        className="resend-card p-12 md:p-32 text-center bg-resend-hairline"
      >
        <Globe className="w-12 h-12 text-resend-hairline-strong mx-auto mb-12" />
        <h2 className="resend-display-xl !text-3xl md:!text-5xl mb-8">{t("about_final_title")}</h2>
        <p className="text-lg text-resend-charcoal max-w-xl mx-auto mb-12 font-serif">
          {t("about_final_desc")}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="resend-button-primary scale-110"
        >
          {t("about_final_cta")}
        </motion.button>
      </motion.div>
    </div>
  );
}
