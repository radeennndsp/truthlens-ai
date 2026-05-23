import React, { useState, useEffect } from "react";
import {
  Shield,
  Menu,
  X,
  User,
  ArrowRight,
  BrainCircuit,
  Zap,
  Fingerprint,
  FileSearch,
  Lock,
  Mail,
  Sun,
  Moon,
  MessageSquare,
  ArrowUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, rtdb } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { onAuthStateChanged, signOut, getRedirectResult, User as FirebaseUser } from "firebase/auth";
import Scanner from "./components/Scanner";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import ForensicAPI from "./components/ForensicAPI";
import BackgroundEffects from "./components/BackgroundEffects";
import AuthModal from "./components/AuthModal";
import { cn } from "./lib/utils";
import { useTheme } from "./context/ThemeContext";
import { useLanguage } from "./context/LanguageContext";
import { DeveloperIntegration, ResourcesGrid, Testimonials, PricingSection } from "./components/LandingSections";
import { Counter } from "./components/Counter";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "about" | "api">("home");
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Always start at the top on mount / page refresh
    window.scrollTo(0, 0);

    // Handle redirect result from Google/GitHub sign-in (fires after page reload from signInWithRedirect)
    getRedirectResult(auth)
      .then((result) => {
        console.log('[TruthLens] getRedirectResult:', result);
        if (result?.user) {
          // Redirect login succeeded — clear any stale form data and close modal
          sessionStorage.removeItem("tl_auth_mode");
          sessionStorage.removeItem("tl_auth_email");
          sessionStorage.removeItem("tl_auth_name");
          setRedirectError(null);
          setShowAuthModal(false);
        }
      })
      .catch((err) => {
        console.warn("[TruthLens] getRedirectResult error:", err?.code, err?.message, err);
        setRedirectError(err?.code ? `${err.code}` : "auth/unknown");
        setShowAuthModal(true);
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // Debug: log auth state transitions
      console.log('[TruthLens] onAuthStateChanged:', u ? { uid: u.uid, email: u.email, provider: u.providerData?.[0]?.providerId } : null);
      setUser(u);
      setLoading(false);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
      setRedirectError(null);

      // Fetch IP from backend before saving user profile
      fetch("/api/my-ip")
        .then(res => res.json())
        .then(data => {
          const ipAddress = data.ip || "Unknown";
          
          const userDocRef = doc(db, "users", user.uid);
          setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            providerId: user.providerData?.[0]?.providerId || null,
            lastLoginAt: new Date().toISOString(),
            ipAddress,
          }, { merge: true }).catch((err) => {
            console.warn("[TruthLens] Failed to persist user profile:", err);
          });

          const userRtdbRef = ref(rtdb, `users/${user.uid}`);
          set(userRtdbRef, {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            providerId: user.providerData?.[0]?.providerId || null,
            lastLoginAt: new Date().toISOString(),
            ipAddress,
          }).catch((err) => {
            console.warn("[TruthLens] Failed to persist user profile to RTDB:", err);
          });
        })
        .catch(err => {
          console.error("[TruthLens] Failed to fetch IP address:", err);
          // Fallback to saving without IP if fetch fails
          const userDocRef = doc(db, "users", user.uid);
          setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            providerId: user.providerData?.[0]?.providerId || null,
            lastLoginAt: new Date().toISOString(),
          }, { merge: true });
        });
    }
  }, [user]);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="resend-display-xl tracking-tighter opacity-80">TL</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-resend-canvas text-resend-ink selection:bg-resend-primary/20 relative transition-colors duration-300">
      <BackgroundEffects />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false);
          setRedirectError(null);
        }} 
        externalError={redirectError}
      />
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled ? "bg-resend-canvas/80 backdrop-blur-md border-resend-hairline-strong py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <img src="/logo.png" alt="TruthLens Logo" className="w-8 h-8 object-contain brightness-0 dark:brightness-200" loading="lazy" />
            <span className="text-lg font-bold tracking-tight uppercase">TruthLens</span>
            <div className="hidden lg:flex items-center gap-2 ml-4 px-2 py-0.5 rounded-full bg-resend-hairline border border-resend-hairline-strong">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t("nav_network_live")}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-6">
              {[
                { id: "home", label: t("nav_verifier") },
                { id: "dashboard", label: t("nav_history") },
                { id: "about", label: t("nav_about") },
                { id: "api", label: t("nav_api") }
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={cn(
                    "text-[13px] font-bold uppercase tracking-widest transition-all",
                    activeTab === link.id ? "text-resend-ink" : "text-resend-charcoal hover:text-resend-ink"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 md:gap-3 lg:border-l lg:border-resend-hairline lg:pl-8">
                <button
                  onClick={() => setLanguage(language === "id" ? "en" : "id")}
                  aria-label="Toggle Language"
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] font-bold border border-resend-hairline-strong hover:bg-resend-hairline transition-all"
                >
                  {language === "id" ? "EN" : "ID"}
                </button>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center border border-resend-hairline-strong hover:bg-resend-hairline transition-all"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="hidden lg:flex items-center gap-3">
                  {user ? (
                    <button onClick={handleLogout} className="resend-button-primary h-10 px-6 flex items-center justify-center rounded-xl">
                      Logout
                    </button>
                  ) : (
                    <button onClick={handleLogin} className="resend-button-primary h-10 px-6 flex items-center justify-center gap-2 rounded-xl">
                      {t("nav_sign_in")} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Mobile Menu"
                className="lg:hidden w-9 h-9 md:w-11 md:h-11 rounded-lg flex items-center justify-center border border-resend-hairline-strong hover:bg-resend-hairline transition-all ml-1 md:ml-2"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-resend-canvas/95 backdrop-blur-xl pt-24 px-6 flex flex-col lg:hidden"
          >
            <div className="flex flex-col gap-6 text-xl font-serif">
              <button className="text-left py-2" onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}>{t("nav_verifier")}</button>
              <button className="text-left py-2" onClick={() => { user ? setActiveTab("dashboard") : handleLogin(); setMobileMenuOpen(false); }}>{t("nav_history")}</button>
              <button className="text-left py-2" onClick={() => { setActiveTab("about"); setMobileMenuOpen(false); }}>{t("nav_about")}</button>
              <button className="text-left py-2" onClick={() => { setActiveTab("api"); setMobileMenuOpen(false); }}>{t("nav_api")}</button>
            </div>


            <div className="mt-auto pb-12 space-y-4">
              <div className="h-px bg-resend-hairline" />
              {!user ? (
                <button
                  onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                  className="resend-button-primary w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full py-4 text-base border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/5 transition-all uppercase tracking-widest font-bold text-xs"
                >
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-40 pb-32 px-6"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] atmospheric-glow-blue pointer-events-none opacity-40" />

              <div className="max-w-7xl mx-auto text-center mb-24 relative">
                <div className="flex justify-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <span className="px-3 py-1 rounded-full border border-resend-hairline-strong text-[10px] font-bold tracking-[0.2em] uppercase text-resend-charcoal">
                      Trusted by 2,000+ investigators
                    </span>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-[11px] font-bold uppercase tracking-[0.4em] text-resend-charcoal"
                >
                  {t("hero_subtitle")}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="resend-display-xl !text-6xl md:!text-8xl lg:!text-9xl tracking-tight leading-[0.85] mb-8"
                >
                  {t("hero_title_1")} <br />
                  <span className="opacity-40">{t("hero_title_2")}</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-lg md:text-xl text-resend-body max-w-xl mx-auto font-serif leading-relaxed mb-12"
                >
                  {t("hero_desc")}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-4 mb-24"
                >
                  <button
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    className="resend-button-primary min-w-[200px] h-[52px] flex items-center justify-center text-[13px] font-bold uppercase tracking-widest"
                  >
                    {t("hero_cta_primary")}
                  </button>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="resend-button-ghost min-w-[200px] h-[52px] flex items-center justify-center text-[13px] font-bold uppercase tracking-widest bg-transparent"
                  >
                    {t("hero_cta_secondary")}
                  </button>
                </motion.div>

                <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto border-y border-resend-hairline py-12">
                  {[
                    { val: 100, suffix: "%", label: t("stat_accuracy") },
                    { val: 200, suffix: "ms", label: t("stat_latency") },
                    { val: 50, suffix: "k+", label: t("stat_analyses") }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + (i * 0.1), ease: "easeOut" }}
                      className="text-center"
                    >
                      <p className="resend-display-xl !text-3xl mb-1">
                        <Counter value={stat.val} suffix={stat.suffix} />
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="max-w-5xl mx-auto">
                <Scanner />
              </div>

              {/* Neural Status Grid */}
              <div className="max-w-7xl mx-auto mt-32 space-y-12">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-resend-hairline" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-resend-charcoal">Neural Engine Status</h3>
                  <div className="h-px flex-1 bg-resend-hairline" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-0">
                  {[
                    { label: "Pixel-Level Heuristics", status: "Operational", lat: "12ms" },
                    { label: "Diffusion Patterns", status: "Operational", lat: "45ms" },
                    { label: "UI Alignment Check", status: "Operational", lat: "82ms" },
                    { label: "Linguistic Bias Scan", status: "Passive", lat: "0ms" },
                  ].map((sys, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-resend-hairline-strong rounded-lg bg-resend-hairline flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-resend-charcoal">{sys.label}</p>
                        <p className="text-[11px] font-mono whitespace-nowrap text-resend-ink">{sys.status}</p>
                      </div>
                      <span className="text-[9px] font-mono text-resend-charcoal">{sys.lat}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feature Grid */}
              <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 pb-32 px-6">
                {[
                  { icon: Fingerprint, title: t("feat_metadata_title"), desc: t("feat_metadata_desc") },
                  { icon: BrainCircuit, title: t("feat_neural_title"), desc: t("feat_neural_desc") },
                  { icon: Lock, title: t("feat_proof_title"), desc: t("feat_proof_desc") },
                  { icon: FileSearch, title: t("feat_tamper_title"), desc: t("feat_tamper_desc") },
                  { icon: MessageSquare, title: t("feat_bias_title"), desc: t("feat_bias_desc") },
                  { icon: Shield, title: t("feat_watermark_title"), desc: t("feat_watermark_desc") },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                    className="resend-card p-10 group"
                  >
                    <feature.icon className="w-8 h-8 text-resend-charcoal mb-6 group-hover:text-resend-ink transition-colors" />
                    <h3 className="text-xl font-medium mb-4">{feature.title}</h3>
                    <p className="text-resend-charcoal text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* New Sections with Scroll Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <DeveloperIntegration onNavigate={() => setActiveTab("api")} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Testimonials />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <ResourcesGrid />
              </motion.div>



              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <PricingSection />
              </motion.div>

              {/* Final CTA Section */}
              <section className="max-w-7xl mx-auto px-6 mt-24 mb-48 text-center relative overflow-hidden py-32 rounded-3xl border border-resend-hairline-strong bg-resend-hairline">
                <div className="absolute inset-0 atmospheric-glow-blue opacity-20 pointer-events-none" />
                <div className="relative z-10 space-y-10">
                  <h2 className="resend-display-xl !text-5xl">{t("final_cta_title")}</h2>
                  <p className="text-resend-charcoal max-w-md mx-auto">{t("final_cta_desc")}</p>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="resend-button-primary px-12 py-4">
                    {t("final_cta_button")}
                  </button>
                </div>
              </section>
            </motion.div>
          ) : activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-40 pb-32 px-6 max-w-7xl mx-auto"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] atmospheric-glow-orange pointer-events-none opacity-20" />
              <h2 className="resend-display-xl mb-12">{t("heading_history")}</h2>
              <Dashboard />
            </motion.div>
          ) : activeTab === "about" ? (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-40 pb-32 px-6 max-w-7xl mx-auto"
            >
              <About onStart={() => setActiveTab("home")} />
            </motion.div>
          ) : (
            <motion.div
              key="api"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-40 pb-32 px-6 max-w-7xl mx-auto"
            >
              <ForensicAPI />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="pt-24 pb-12 border-t border-resend-hairline bg-resend-canvas relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="TruthLens Logo" className="w-6 h-6 object-contain brightness-0 dark:brightness-200" />
                <span className="font-bold tracking-tighter uppercase">TruthLens</span>
              </div>
              <p className="max-w-xs text-resend-charcoal text-sm leading-relaxed">Empowering investigative journalists, researchers, and citizens with AI forensic intelligence.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:gap-12 md:col-span-2">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal mb-6">Product</h4>
                <ul className="space-y-4 text-sm text-resend-body">
                  <li>
                    <button
                      onClick={() => { setActiveTab("home"); setTimeout(() => window.scrollTo({ top: 800, behavior: "smooth" }), 100); }}
                      className="hover:text-resend-ink transition-colors text-left"
                    >Scanner</button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("api")}
                      className="hover:text-resend-ink transition-colors text-left"
                    >API Keys</button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab("home"); setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                      className="hover:text-resend-ink transition-colors text-left"
                    >Pricing</button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-resend-charcoal mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-resend-body">
                  <li>
                    <button
                      onClick={() => setActiveTab("about")}
                      className="hover:text-resend-ink transition-colors text-left"
                    >About</button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="hover:text-resend-ink transition-colors text-left"
                    >Blog</button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="hover:text-resend-ink transition-colors text-left"
                    >Careers</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-resend-hairline text-[11px] font-bold tracking-widest text-resend-charcoal uppercase text-center md:text-left">
            <span>© 2026 TruthLens Forensics. Built for GDG. #JuaraVibeCoding Season1</span>
            <div className="flex gap-8">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-resend-ink transition-colors">Privacy</button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-resend-ink transition-colors">Terms</button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-resend-ink transition-colors">Status</button>
            </div>
          </div>
        </div>
      </footer>
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-resend-ink text-resend-canvas shadow-2xl flex items-center justify-center border border-resend-hairline-strong backdrop-blur-md"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
