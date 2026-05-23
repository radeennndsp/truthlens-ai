import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  Github, 
  Chrome, 
  ArrowRight,
  AlertCircle,
  Loader2,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth,
  googleProvider,
  githubProvider
} from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { cn } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  externalError?: string | null;
}

export default function AuthModal({ isOpen, onClose, externalError }: AuthModalProps) {
  // Restore mode and email from sessionStorage so they survive page refreshes.
  // Password is intentionally NOT persisted for security reasons.
  const [mode, setMode] = useState<"signin" | "signup" | "forgot-pwd" | "forgot-pwd-verify" | "forgot-pwd-new">(() => {
    return (sessionStorage.getItem("tl_auth_mode") as any) ?? "signin";
  });
  const [email, setEmail] = useState(() => sessionStorage.getItem("tl_auth_email") ?? "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem("tl_auth_name") ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();

  // Sync form state back to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("tl_auth_mode", mode);
  }, [mode]);

  useEffect(() => {
    sessionStorage.setItem("tl_auth_email", email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem("tl_auth_name", displayName);
  }, [displayName]);

  // Clear sessionStorage once login succeeds
  const clearPersistedFormData = () => {
    sessionStorage.removeItem("tl_auth_mode");
    sessionStorage.removeItem("tl_auth_email");
    sessionStorage.removeItem("tl_auth_name");
  };

  const getFriendlyErrorMessage = (code: string, originalMessage: string): string => {
    const isId = language === "id";
    switch (code) {
      case "auth/popup-closed-by-user":
        return isId 
          ? "Masuk dibatalkan karena jendela login ditutup." 
          : "Sign-in was cancelled because the login window was closed.";
      case "auth/popup-blocked":
        return isId 
          ? "Jendela pop-up diblokir oleh browser Anda. Harap aktifkan pop-up untuk situs ini." 
          : "The pop-up window was blocked by your browser. Please allow pop-ups for this site.";
      case "auth/unauthorized-domain":
        return isId
          ? "Domain ini tidak diizinkan untuk masuk dengan Google/GitHub. Harap tambahkan domain ini ke daftar domain yang diotorisasi di Firebase Console."
          : "This domain is not authorized for sign-in. Please add this domain to the authorized domains list in the Firebase Console.";
      case "auth/operation-not-allowed":
        return isId 
          ? "Metode masuk ini belum diaktifkan di Firebase Console. Silakan hubungi administrator." 
          : "This sign-in method is not enabled in the Firebase Console. Please contact the administrator.";
      case "auth/user-not-found":
        return isId 
          ? "Pengguna tidak ditemukan. Silakan periksa kembali email Anda atau buat akun baru." 
          : "User not found. Please check your email or create a new account.";
      case "auth/wrong-password":
        return isId 
          ? "Kata sandi salah. Silakan coba lagi." 
          : "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return isId 
          ? "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain." 
          : "This email address is already registered. Please sign in or use another email.";
      case "auth/weak-password":
        return isId 
          ? "Kata sandi terlalu lemah. Gunakan minimal 6 karakter." 
          : "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return isId 
          ? "Format alamat email tidak valid." 
          : "Invalid email address format.";
      case "auth/invalid-credential":
        return isId 
          ? "Email atau kata sandi tidak valid. Silakan coba lagi." 
          : "Invalid email or password. Please try again.";
      case "auth/network-request-failed":
        return isId 
          ? "Koneksi jaringan terganggu. Silakan periksa koneksi internet Anda." 
          : "Network connection failed. Please check your internet connection.";
      case "auth/too-many-requests":
        return isId 
          ? "Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi nanti." 
          : "Too many failed sign-in attempts. Please try again later.";
      default:
        if (originalMessage?.startsWith("Firebase: ")) {
          return originalMessage.replace("Firebase: ", "");
        }
        return originalMessage || (isId ? "Terjadi kesalahan saat otentikasi." : "An error occurred during authentication.");
    }
  };

  useEffect(() => {
    if (isOpen && externalError) {
      setError(getFriendlyErrorMessage(externalError, ""));
    } else if (!isOpen) {
      setError(null);
    }
  }, [isOpen, externalError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        clearPersistedFormData();
        onClose();
      } else if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        clearPersistedFormData();
        onClose();
      } else if (mode === "forgot-pwd") {
        // Send OTP
        const res = await fetch("/api/forgot-password/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengirim OTP");
        setSuccess(data.message);
        setMode("forgot-pwd-verify");
      } else if (mode === "forgot-pwd-verify") {
        // Verify OTP
        const res = await fetch("/api/forgot-password/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memverifikasi OTP");
        setSuccess("OTP berhasil diverifikasi.");
        setMode("forgot-pwd-new");
      } else if (mode === "forgot-pwd-new") {
        const res = await fetch("/api/forgot-password/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: otp, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mereset kata sandi");
        
        setSuccess(data.message);
        setTimeout(() => {
          setMode("signin");
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: "google" | "github") => {
    setError(null);
    setLoading(true);

    const provider = providerName === "google" ? googleProvider : githubProvider;
    const isIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();

    if (isIframe) {
      setError(
        language === "id"
          ? "Masuk dengan Google/GitHub tidak didukung di dalam frame ini. Buka aplikasi di tab browser baru dan coba lagi."
          : "Google/GitHub sign-in is not supported inside this frame. Please open the app in a browser tab and try again."
      );
      setLoading(false);
      return;
    }

    try {
      console.log(`[TruthLens] Opening popup sign-in for ${providerName}...`);
      await signInWithPopup(auth, provider);
      clearPersistedFormData();
      onClose();
    } catch (err: any) {
      console.error(`[TruthLens] ${providerName} popup failed:`, err?.code, err?.message);
      setError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md resend-card bg-resend-canvas p-6 md:p-8 relative shadow-2xl border-resend-hairline-strong max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-resend-charcoal hover:text-resend-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-serif mb-2">
            {mode === "signin" && t("auth_welcome_back")}
            {mode === "signup" && t("auth_create_account")}
            {mode === "forgot-pwd" && t("forgot_pwd_title")}
            {mode === "forgot-pwd-verify" && t("forgot_pwd_otp_title")}
            {mode === "forgot-pwd-new" && t("forgot_pwd_new_title")}
          </h2>
          <p className="text-sm text-resend-charcoal">
            {mode === "signin" && t("auth_signin_desc")}
            {mode === "signup" && t("auth_signup_desc")}
            {mode === "forgot-pwd" && t("forgot_pwd_desc")}
            {mode === "forgot-pwd-verify" && t("forgot_pwd_otp_desc")}
            {mode === "forgot-pwd-new" && t("forgot_pwd_new_desc")}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500 text-sm">
            {success}
          </div>
        )}

        {(mode === "signin" || mode === "signup") && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-resend-hairline-strong bg-resend-hairline hover:bg-resend-hairline-strong transition-all text-sm font-medium"
              >
                <Chrome className="w-4 h-4" />
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin("github")}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-resend-hairline-strong bg-resend-hairline hover:bg-resend-hairline-strong transition-all text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-resend-hairline-strong" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-resend-canvas px-4 text-resend-charcoal">{t("auth_or_continue")}</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal px-1">{t("auth_full_name")}</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-resend-hairline border border-resend-hairline-strong rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-resend-charcoal transition-all"
                  placeholder="John Doe"
                />
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-resend-charcoal" />
              </div>
            </div>
          )}
          
          {(mode === "signin" || mode === "signup" || mode === "forgot-pwd") && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal px-1">{t("auth_email")}</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-resend-hairline border border-resend-hairline-strong rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-resend-charcoal transition-all disabled:opacity-50"
                  placeholder="investigator@truthlens.ai"
                />
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-resend-charcoal" />
              </div>
            </div>
          )}

          {mode === "forgot-pwd-verify" && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal px-1">OTP Code</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-resend-hairline border border-resend-hairline-strong rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-resend-charcoal transition-all text-center tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-resend-charcoal" />
              </div>
            </div>
          )}

          {(mode === "signin" || mode === "signup") && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal px-1">{t("auth_password")}</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-resend-hairline border border-resend-hairline-strong rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-resend-charcoal transition-all"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-resend-charcoal" />
              </div>
            </div>
          )}

          {mode === "forgot-pwd-new" && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal px-1">{t("forgot_pwd_new_title")}</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-resend-hairline border border-resend-hairline-strong rounded-lg p-3 pl-10 text-sm focus:outline-none focus:border-resend-charcoal transition-all"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-resend-charcoal" />
              </div>
            </div>
          )}

          {mode === "signin" && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => { setMode("forgot-pwd"); setError(null); setSuccess(null); }}
                className="text-xs text-resend-charcoal hover:text-resend-ink hover:underline"
              >
                {t("forgot_pwd_link")}
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full resend-button-primary py-4 flex items-center justify-center gap-2 group mt-4 overflow-hidden"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === "signin" && t("auth_btn_signin")}
                {mode === "signup" && t("auth_btn_signup")}
                {mode === "forgot-pwd" && t("forgot_pwd_btn_send")}
                {mode === "forgot-pwd-verify" && t("forgot_pwd_btn_verify")}
                {mode === "forgot-pwd-new" && t("forgot_pwd_btn_save")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {mode.startsWith("forgot-pwd") ? (
          <p className="mt-8 text-center text-xs text-resend-charcoal">
            <button 
              onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
              className="text-resend-ink font-bold hover:underline"
            >
              {t("forgot_pwd_back")}
            </button>
          </p>
        ) : (
          <p className="mt-8 text-center text-xs text-resend-charcoal">
            {mode === "signin" ? t("auth_no_account") : t("auth_have_account")}{" "}
            <button 
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setSuccess(null); }}
              className="text-resend-ink font-bold hover:underline"
            >
              {mode === "signin" ? t("auth_link_signup") : t("auth_link_signin")}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
