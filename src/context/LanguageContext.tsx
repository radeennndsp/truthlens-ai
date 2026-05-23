import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navbar
    nav_verifier: "Verifier",
    nav_history: "Riwayat",
    nav_about: "Tentang",
    nav_api: "Forensics API",
    nav_sign_in: "Masuk",
    nav_network_live: "Jaringan Aktif",

    // Hero
    hero_title_1: "Kebenaran",
    hero_title_2: "yang dibayangkan kembali.",
    hero_subtitle: "Forensik untuk semua orang.",
    hero_desc: "Verifikasi bukti digital dalam hitungan detik. Deteksi manipulasi tangkapan layar, pemicu emosional, dan konteks yang hilang dengan analisis forensik bertenaga AI.",
    hero_cta_primary: "Mulai Verifikasi",
    hero_cta_secondary: "Kontak Penjualan",
    hero_trusted: "Dipercaya oleh 2.000+ investigator",

    // Stats
    stat_accuracy: "Akurasi Pixel",
    stat_latency: "Latensi Neural",
    stat_analyses: "Analisis/Hari",

    // Features
    feat_metadata_title: "Analisis Metadata",
    feat_metadata_desc: "Analisis mendalam data EXIF dan properti file untuk mendeteksi tanda tangan alat dan manipulasi berbasis perangkat lunak.",
    feat_neural_title: "Neural Contextualizer",
    feat_neural_desc: "Model AI yang dilatih pada jutaan pola chat untuk mengidentifikasi aliran percakapan yang tidak alami dan elemen UI yang diedit.",
    feat_proof_title: "Bukti Terverifikasi",
    feat_proof_desc: "Hasilkan laporan yang ditandatangani secara kriptografis untuk mengonfirmasi keaslian (atau ketiadaan) aset digital.",
    feat_tamper_title: "Deteksi Manipulasi",
    feat_tamper_desc: "Mendeteksi perbedaan tingkat piksel dan pola kloning yang menunjukkan pengeditan gambar langsung atau manipulasi lokal.",
    feat_bias_title: "Pemindaian Bias Linguistik",
    feat_bias_desc: "Menganalisis teks yang diekstrak untuk manipulasi emosional, bias ekstrem, dan pola yang umum ditemukan dalam kampanye misinformasi.",
    feat_watermark_title: "Cek Watermark AI",
    feat_watermark_desc: "Mengidentifikasi watermark digital yang tidak terlihat dan tanda tangan noise yang tertanam oleh model AI generatif modern.",

    // Pricing
    pricing_title: "Pilih paket Anda.",
    pricing_subtitle: "Mulai secara gratis dan tingkatkan seiring kebutuhan forensik Anda berkembang.",
    pricing_popular: "Paling Populer",
    pricing_cta: "Pilih Paket",
    plan_lite: "Lite",
    plan_pro: "Pro",
    plan_enterprise: "Enterprise",
    plan_lite_desc: "Untuk penggunaan personal dan riset dasar.",
    plan_pro_desc: "Fitur lengkap untuk investigator profesional.",
    plan_enterprise_desc: "Solusi kustom untuk institusi dan korporasi.",

    // Footer
    footer_desc: "Memberdayakan jurnalis investigasi, peneliti, dan warga negara dengan intelijen forensik AI.",
    footer_product: "Produk",
    footer_company: "Perusahaan",
    footer_copyright: "© 2026 TruthLens Forensics. Dibuat untuk GDG.",

    // Dev Integration
    dev_title: "Integrasi untuk",
    dev_subtitle: "Developer.",
    dev_desc: "Bangun sistem verifikasi otomatis ke dalam aplikasi Anda sendiri dengan API forensik kami yang tangguh.",
    dev_cta: "Baca Dokumentasi",

    // Testimonials
    test_title: "Dipercaya oleh mereka yang",
    test_subtitle: "memprioritaskan kebenaran.",

    // About Page
    about_hero_title_1: "Akhir dari",
    about_hero_title_2: "penipuan digital.",
    about_hero_desc: "TruthLens adalah platform forensik sintetis yang dibangun untuk memverifikasi integritas komunikasi visual di era deepfake dan manipulasi berbasis AI.",
    about_philosophy_title: "Standar baru untuk interaksi verifikasi-pertama.",
    about_philosophy_desc: "Metadata tradisional tidak lagi cukup. Mesin forensik TruthLens menganalisis distribusi piksel, artefak domain frekuensi, dan penanda sosiolinguistik untuk memberikan skor kepercayaan definitif.",
    about_pillar_title: "Tiga Pilar Utama",
    about_pillar_1_title: "Deteksi Sintetis",
    about_pillar_1_desc: "Mengidentifikasi artefak AI generatif, pola difusi, dan ketidakkonsistenan tingkat piksel yang luput dari mata manusia.",
    about_pillar_2_title: "Linguistik Kognitif",
    about_pillar_2_desc: "Menganalisis titik tekanan emosional dan pemicu psikologis yang digunakan dalam phishing dan konten manipulatif.",
    about_pillar_3_title: "Integritas Forensik",
    about_pillar_3_desc: "Analisis terenkripsi ujung-ke-ujung memastikan bukti Anda tetap pribadi sementara kebenarannya diverifikasi.",
    about_final_title: "Siap untuk menyaksikan kebenaran?",
    about_final_desc: "Bergabunglah dengan ribuan analis dan ahli forensik yang menggunakan TruthLens untuk mengamankan perbatasan digital.",
    about_final_cta: "Inisialisasi Scanner",

    // Forensic API Page
    api_hero_title: "Kebenaran secepat kode.",
    api_hero_desc: "Otomatiskan alur kerja forensik Anda dengan API kelas perusahaan kami. Dirancang untuk volume tinggi dan latensi rendah.",
    api_console_title: "Konsol Pengembang",
    api_console_desc: "Mulai integrasi dalam hitungan menit dengan RESTful API kami yang terdokumentasi dengan baik.",
    api_endpoint_label: "Endpoint Analisis",
    api_auth_label: "Otentikasi",
    api_auth_desc: "Gunakan Bearer Token untuk permintaan yang aman.",
    api_ecosystem: "Ekosistem Pengembang",
    api_copied: "Endpoint API disalin ke papan klip",
    api_feat_1_title: "Infrastruktur Skala Global",
    api_feat_1_desc: "Klaster GPU terdistribusi memastikan hasil analisis dalam hitungan detik, bukan menit.",
    api_feat_2_title: "SDK & Pre-builds",
    api_feat_2_desc: "Pustaka resmi untuk Python, Go, Node.js, dan Ruby tersedia dalam dokumentasi.",
    api_feat_3_title: "Webhooks Real-time",
    api_feat_3_desc: "Dapatkan callback asinkron untuk pemrosesan forensik mendalam.",

    // Final CTA
    final_cta_title: "Siap memverifikasi kebenaran?",
    final_cta_desc: "Bergabunglah dengan ribuan ahli dan investigator yang menggunakan TruthLens setiap hari.",
    final_cta_button: "Mulai Verifikasi Sekarang",

    // Scanner
    scan_drop_title: "Tarik & Lepas Bukti Di Sini",
    scan_drop_subtitle: "Dukungan untuk PNG, JPG, dan Screenshot (Maks 10MB)",
    scan_btn_select: "Pilih File",
    scan_btn_start: "Inisialisasi Analisis Forensik",
    scan_status_upload: "Mengunggah Bukti...",
    scan_status_neural: "Neural Contextualizer sedang bekerja...",
    scan_status_metadata: "Mengekstrak Metadata Pixel...",
    scan_status_complete: "Analisis Selesai",
    scan_trust_score: "Skor Kepercayaan",
    scan_verdict_high: "AUTENTIK",
    scan_verdict_med: "MENCURIGAKAN",
    scan_verdict_low: "TERMANIPULASI",
    scan_summary_title: "Ringkasan Eksekutif",
    scan_btn_reset: "Scan Baru",
    scan_btn_clear: "Bersihkan Pilihan",
    scan_btn_analyze: "Analisis",
    scan_btn_back: "Kembali ke Scanner",
    scan_dossier_ref: "REF Berkas",
    scan_asset_title: "Materi Teranalisis",
    scan_engine_footer: "TruthLens Synthetic Forensics v3.2 Neural-Engine",
    scan_risk: "Risiko",
    scan_intent_type: "Jenis Niat",
    scan_unknown: "Tidak Diketahui",
    scan_limit_reached: "Batas Pengecekan Tercapai",
    scan_limit_sub: "Anda telah menggunakan 3 kuota gratis. Silakan berlangganan Pro untuk akses tak terbatas.",

    // Dashboard
    dash_total_files: "Total Berkas",
    dash_threats: "Ancaman Terdeteksi",
    dash_system_trust: "Kepercayaan Sistem",
    dash_no_records: "Tidak ada catatan scan yang ditemukan.",
    dash_start_scan: "Mulai Scan Pertama Anda",
    dash_delete_confirm: "Scan dihapus",
    dash_delete_confirm_msg: "Apakah Anda yakin ingin menghapus riwayat pengecekan ini? Tindakan ini tidak dapat dibatalkan.",
    dash_log: "Log Barang Bukti",
    dash_resync: "Sinkronisasi Ulang",
    dash_index: "Indeks Data",

    // Chat
    chat_title: "Analis Forensik AI",
    chat_connected: "Terhubung ke TruthLens Insight",
    chat_welcome: "Tanyakan apa saja tentang analisis ini. Saya dapat menjelaskan skor kepercayaan, penanda emosional, atau anomali teknis yang ditemukan pada bukti.",
    chat_placeholder: "Tanya detail lebih lanjut...",
    chat_analyzing: "Menganalisis konteks...",
    chat_error: "Saya mengalami kesalahan saat memproses permintaan Anda. Silakan periksa koneksi atau API key Anda.",

    // Page Headings
    heading_history: "Riwayat & Berkas",
    heading_about: "Misi Kami",
    heading_api: "Dokumentasi API",

    // Dossier
    dos_official_report: "Laporan Investigasi Resmi",
    dos_primary_asset: "Aset Utama",
    dos_credibility: "Verifikasi Kredibilitas",
    dos_confidence: "Kepercayaan",
    dos_classification: "Klasifikasi",
    dos_anomalies: "Anomali Terdeteksi",
    dos_transcript: "Transkrip Forensik",
    dos_btn_export: "Ekspor Laporan",
    dos_btn_share: "Bagikan Studi Kasus",
    dos_btn_metadata: "Lihat Metadata Sumber",
    dos_meta_title: "Analisis Metadata Internal",
    link_copied: "Detail laporan disalin ke papan klip",

    // Auth
    auth_welcome_back: "Selamat datang kembali",
    auth_create_account: "Buat akun baru",
    auth_signin_desc: "Masuk untuk mengakses riwayat forensik Anda.",
    auth_signup_desc: "Mulai perjalanan investigasi Anda hari ini.",
    auth_or_continue: "Atau lanjutkan dengan",
    auth_full_name: "Nama Lengkap",
    auth_email: "Alamat Email",
    auth_password: "Kata Sandi",
    auth_btn_signin: "Masuk",
    auth_btn_signup: "Daftar Akun",
    auth_no_account: "Belum punya akun?",
    auth_have_account: "Sudah punya akun?",
    auth_link_signup: "Daftar",
    auth_link_signin: "Masuk",
    logout_otp_title: "Konfirmasi Logout",
    logout_otp_desc: "Masukkan kode OTP yang dikirim ke email Anda untuk keluar dari akun.",
    logout_otp_send: "Kirim Kode OTP",
    logout_otp_resend: "Kirim Ulang Kode",
    logout_otp_label: "Kode OTP",
    logout_otp_confirm: "Konfirmasi Logout",
    logout_otp_cancel: "Batal",
    logout_otp_sent: "Kode OTP telah dikirim ke email Anda.",
    logout_otp_error_no_email: "Tidak ada alamat email yang tersedia untuk mengirim kode.",
    logout_otp_error_invalid: "Kode OTP tidak valid. Silakan coba lagi.",
    logout_otp_error_expired: "Kode OTP telah kedaluwarsa. Kirim ulang untuk menerima kode baru.",
    logout_otp_note: "Kode OTP kadaluwarsa dalam 5 menit.",
    forgot_pwd_title: "Lupa Kata Sandi",
    forgot_pwd_desc: "Masukkan email Anda untuk menerima kode OTP reset kata sandi.",
    forgot_pwd_btn_send: "Kirim OTP Reset",
    forgot_pwd_back: "Kembali ke Masuk",
    forgot_pwd_otp_title: "Verifikasi OTP",
    forgot_pwd_otp_desc: "Masukkan kode OTP yang dikirim ke email Anda.",
    forgot_pwd_btn_verify: "Verifikasi OTP",
    forgot_pwd_new_title: "Kata Sandi Baru",
    forgot_pwd_new_desc: "Masukkan kata sandi baru untuk akun Anda.",
    forgot_pwd_btn_save: "Simpan Kata Sandi",
    forgot_pwd_success: "Kata sandi berhasil diatur ulang. Silakan masuk.",
    forgot_pwd_link: "Lupa kata sandi?"
  },
  en: {
    // Navbar
    nav_verifier: "Verifier",
    nav_history: "History",
    nav_about: "About",
    nav_api: "Forensics API",
    nav_sign_in: "Sign In",
    nav_network_live: "Network Live",

    // Hero
    hero_title_1: "Truth",
    hero_title_2: "reimagined.",
    hero_subtitle: "Forensics for everyone.",
    hero_desc: "Verify digital evidence in seconds. Detect screenshots manipulation, emotional triggers, and missing context with AI-powered forensic analysis.",
    hero_cta_primary: "Start Verification",
    hero_cta_secondary: "Contact Sales",
    hero_trusted: "Trusted by 2,000+ investigators",

    // Stats
    stat_accuracy: "Pixel Accuracy",
    stat_latency: "Neural Latency",
    stat_analyses: "Analyses/Day",

    // Features
    feat_metadata_title: "Metadata Analysis",
    feat_metadata_desc: "Advanced analysis of EXIF data and file properties to detect tool signatures and software-based manipulation.",
    feat_neural_title: "Neural Contextualizer",
    feat_neural_desc: "AI models trained on millions of chat patterns to identify unnatural conversation flows and edited UI elements.",
    feat_proof_title: "Verified Proof",
    feat_proof_desc: "Generate cryptographically signed reports that confirm the authenticity (or lack thereof) of digital assets.",
    feat_tamper_title: "Tamper Detection",
    feat_tamper_desc: "Detecting pixel-level discrepancies and cloning patterns that indicate direct image editing or localized manipulation.",
    feat_bias_title: "Linguistic Bias Scan",
    feat_bias_desc: "Analyzing extracted text for emotional manipulation, extreme bias, and patterns commonly found in misinformation campaigns.",
    feat_watermark_title: "AI Watermark Check",
    feat_watermark_desc: "Identifying invisible digital watermarks and noise signatures embedded by modern generative AI models like Midjourney or DALL-E.",

    // Pricing
    pricing_title: "Choose your plan.",
    pricing_subtitle: "Start for free and scale as your forensic needs grow.",
    pricing_popular: "Most Popular",
    pricing_cta: "Choose Plan",
    plan_lite: "Lite",
    plan_pro: "Pro",
    plan_enterprise: "Enterprise",
    plan_lite_desc: "For personal use and basic research.",
    plan_pro_desc: "Full features for professional investigators.",
    plan_enterprise_desc: "Custom solutions for institutions and corporations.",

    // Footer
    footer_desc: "Empowering investigative journalists, researchers, and citizens with AI forensic intelligence.",
    footer_product: "Product",
    footer_company: "Company",
    footer_copyright: "© 2026 TruthLens Forensics. Built for GDG.",

    // Dev Integration
    dev_title: "Integration for",
    dev_subtitle: "Developers.",
    dev_desc: "Build automated verification systems into your own applications with our robust forensic API.",
    dev_cta: "Read Documentation",

    // Testimonials
    test_title: "Trusted by those who",
    test_subtitle: "prioritize the truth.",

    // About Page
    about_hero_title_1: "The end of",
    about_hero_title_2: "digital deception.",
    about_hero_desc: "TruthLens is a synthetic forensics platform built to verify the integrity of visual communication in an era of deepfakes and AI-driven manipulation.",
    about_philosophy_title: "A new standard for verify-first interaction.",
    about_philosophy_desc: "Traditional metadata is no longer enough. TruthLens' forensic engine analyzes pixel distribution, frequency domain artifacts, and sociolinguistic markers to provide a definitive trust score.",
    about_pillar_title: "The Three Pillars",
    about_pillar_1_title: "Synthetic Detection",
    about_pillar_1_desc: "Identifying generative AI artifacts, diffusion patterns, and pixel-level inconsistencies that escape the human eye.",
    about_pillar_2_title: "Cognitive Linguistics",
    about_pillar_2_desc: "Analyzing the emotional pressure points and psychological triggers used in phishing and manipulative content.",
    about_pillar_3_title: "Forensic Integrity",
    about_pillar_3_desc: "End-to-end encrypted analysis ensuring that your evidence remains private while its veracity is verified.",
    about_final_title: "Ready to witness the truth?",
    about_final_desc: "Join thousands of analysts and forensic experts using TruthLens to secure the digital frontier.",
    about_final_cta: "Initialize Scanner",

    // Forensic API Page
    api_hero_title: "Truth at the speed of code.",
    api_hero_desc: "Automate your forensic workflows with our enterprise-grade API. Built for high volume and low latency.",
    api_console_title: "Developer Console",
    api_console_desc: "Start integration in minutes with our well-documented RESTful API.",
    api_endpoint_label: "Analysis Endpoint",
    api_auth_label: "Authentication",
    api_auth_desc: "Use Bearer Tokens for secure requests.",
    api_ecosystem: "Developer Ecosystem",
    api_copied: "API endpoint copied to clipboard",
    api_feat_1_title: "Global Scale Infrastructure",
    api_feat_1_desc: "Distributed GPU clusters ensure analysis results in seconds, not minutes.",
    api_feat_2_title: "SDKs & Pre-builds",
    api_feat_2_desc: "Official libraries for Python, Go, Node.js and Ruby available in the documentation.",
    api_feat_3_title: "Real-time Webhooks",
    api_feat_3_desc: "Get asynchronous callbacks for deep forensic processing.",

    // Final CTA
    final_cta_title: "Ready to verify the truth?",
    final_cta_desc: "Join thousands of experts and investigators using TruthLens every day.",
    final_cta_button: "Start Verification Now",

    // Scanner
    scan_drop_title: "Drag & Drop Evidence Here",
    scan_drop_subtitle: "Supports PNG, JPG, and Screenshots (Max 10MB)",
    scan_btn_select: "Select File",
    scan_btn_start: "Initialize Forensic Analysis",
    scan_status_upload: "Uploading Evidence...",
    scan_status_neural: "Neural Contextualizer in action...",
    scan_status_metadata: "Extracting Pixel Metadata...",
    scan_status_complete: "Analysis Complete",
    scan_trust_score: "Trust Score",
    scan_verdict_high: "AUTHENTIC",
    scan_verdict_med: "SUSPICIOUS",
    scan_verdict_low: "MANIPULATED",
    scan_summary_title: "Executive Summary",
    scan_btn_reset: "New Scan",
    scan_btn_clear: "Clear Selection",
    scan_btn_analyze: "Analyze",
    scan_btn_back: "Back to Scanner",
    scan_dossier_ref: "Dossier REF",
    scan_asset_title: "Analyzed Material",
    scan_engine_footer: "TruthLens Synthetic Forensics v3.2 Neural-Engine",
    scan_risk: "Risk",
    scan_intent_type: "Intent Type",
    scan_unknown: "Unknown",
    scan_limit_reached: "Scan Limit Reached",
    scan_limit_sub: "You have used your 3 free scans. Please subscribe to Pro for unlimited access.",

    // Dashboard
    dash_total_files: "Total Files",
    dash_threats: "Threats Detected",
    dash_system_trust: "System Trust",
    dash_no_records: "No scan records found.",
    dash_start_scan: "Start Your First Scan",
    dash_delete_confirm: "Scan deleted",
    dash_delete_confirm_msg: "Are you sure you want to delete this scan record? This action cannot be undone.",
    dash_log: "Evidence Log",
    dash_resync: "Re-sync Repository",
    dash_index: "Data Index",

    // Chat
    chat_title: "Forensic Analyst AI",
    chat_connected: "Connected to TruthLens Insight",
    chat_welcome: "Ask me anything about this analysis. I can explain the trust score, emotional markers, or technical anomalies found in the evidence.",
    chat_placeholder: "Ask for more details...",
    chat_analyzing: "Analyzing context...",
    chat_error: "I encountered an error while processing your request. Please check your connection or API key.",

    // Page Headings
    heading_history: "History & Dossiers",
    heading_about: "The Mission",
    heading_api: "Documentation",

    // Dossier
    dos_official_report: "Official Investigation Report",
    dos_primary_asset: "Primary Asset",
    dos_credibility: "Credential Verification",
    dos_confidence: "Confidence",
    dos_classification: "Classification",
    dos_anomalies: "Detected Anomalies",
    dos_transcript: "Forensics Transcript",
    dos_btn_export: "Export Report",
    dos_btn_share: "Share Case Study",
    dos_btn_metadata: "View Source Metadata",
    dos_meta_title: "Internal Metadata Analysis",
    link_copied: "Report details copied to clipboard",

    // Auth
    auth_welcome_back: "Welcome back",
    auth_create_account: "Create an account",
    auth_signin_desc: "Sign in to access your forensic history.",
    auth_signup_desc: "Start your investigative journey today.",
    auth_or_continue: "Or continue with",
    auth_full_name: "Full Name",
    auth_email: "Email Address",
    auth_password: "Password",
    auth_btn_signin: "Sign In",
    auth_btn_signup: "Create Account",
    auth_no_account: "Don't have an account?",
    auth_have_account: "Already have an account?",
    auth_link_signup: "Sign up",
    auth_link_signin: "Sign in",
    logout_otp_title: "Logout Confirmation",
    logout_otp_desc: "Enter the OTP sent to your email to sign out safely.",
    logout_otp_send: "Send OTP",
    logout_otp_resend: "Resend OTP",
    logout_otp_label: "OTP Code",
    logout_otp_confirm: "Confirm Logout",
    logout_otp_cancel: "Cancel",
    logout_otp_sent: "OTP has been sent to your email.",
    logout_otp_error_no_email: "No email available to send the code.",
    logout_otp_error_invalid: "The OTP code is invalid. Please try again.",
    logout_otp_error_expired: "The OTP code has expired. Resend to get a new one.",
    logout_otp_note: "The code expires in 5 minutes.",
    forgot_pwd_title: "Forgot Password",
    forgot_pwd_desc: "Enter your email to receive a password reset OTP.",
    forgot_pwd_btn_send: "Send Reset OTP",
    forgot_pwd_back: "Back to Sign In",
    forgot_pwd_otp_title: "Verify OTP",
    forgot_pwd_otp_desc: "Enter the OTP sent to your email.",
    forgot_pwd_btn_verify: "Verify OTP",
    forgot_pwd_new_title: "New Password",
    forgot_pwd_new_desc: "Enter a new password for your account.",
    forgot_pwd_btn_save: "Save Password",
    forgot_pwd_success: "Password successfully reset. Please sign in.",
    forgot_pwd_link: "Forgot password?"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("truthlens_lang");
    return (saved as Language) || "id";
  });

  useEffect(() => {
    localStorage.setItem("truthlens_lang", language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
