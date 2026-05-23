# 🛡️ TruthLens AI: Digital Forensic Observer

TruthLens AI adalah platform forensik digital tingkat lanjut yang dirancang untuk mendeteksi manipulasi gambar dan dokumen menggunakan kecerdasan buatan **Gemini 3.5 Flash**. Dengan pendekatan "Skeptical Bias", sistem ini mengungkap anomali piksel, ketidaksinkronan metadata, dan bias informasi yang sering terlewatkan oleh mata manusia.

[![Design System](https://img.shields.io/badge/Design-Resend--Inspired-black?style=for-the-badge)](design.md)
[![AI Core](https://img.shields.io/badge/AI-Gemini--3.5--Flash-blue?style=for-the-badge)](AGENTS.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

---

## 🚀 Fitur Utama

- **🔍 Image Forensic Scanner**: Deteksi manipulasi piksel, kloning, dan inkonsistensi pencahayaan pada gambar.
- **📄 Document Integrity Examiner**: Analisis mendalam dokumen PDF/Word untuk mencari bias linguistik dan anomali metadata.
- **💬 Forensic Chat Assistance**: Lakukan tanya jawab mendalam terhadap bukti digital yang ditemukan.
- **🌐 Multilingual Interface**: Dukungan penuh Bahasa Indonesia dan Inggris.
- **🌓 Adaptive Dark Mode**: Antarmuka "Editorial-Serif" yang nyaman untuk analisis intensif.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, Multer (Memory Storage).
- **AI Engine**: Google Gemini 3.5 Flash.
- **Auth & DB**: Firebase Authentication & Firestore.
- **Security**: Helmet, CORS, Express Rate Limit.

---

## 💻 Instalasi Lokal

### Prasyarat
- Node.js (v18 ke atas)
- Google Gemini API Key ([Dapatkan di sini](https://aistudio.google.com/))
- Firebase Project (untuk autentikasi)

### Langkah-langkah
1. **Clone Repository**
   ```bash
   git clone https://github.com/radeennndsp/truthlens-ai.git
   cd truthlens-ai
   ```

2. **Install Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan isi variabel yang diperlukan:
   ```bash
   cp .env.example .env
   ```

4. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🤖 Integrasi AI & Arsitektur

TruthLens menggunakan arsitektur **Proxy Backend** untuk menjaga keamanan API Key. 
- Alur kerja: `User Upload` -> `Express Proxy` -> `Document/Image Parsing` -> `Gemini 3.5 Flash` -> `Structured JSON Result`.
- Detail mengenai logika agen AI dapat ditemukan di [**AGENTS.md**](AGENTS.md).
- Detail mengenai sistem desain dapat ditemukan di [**design.md**](design.md).

---

## ☁️ Deployment (Google Cloud Run)

Proyek ini sudah dilengkapi dengan Dockerfile yang dioptimalkan.

1. **Build & Deploy**
   ```bash
   gcloud run deploy truthlens-ai --source . --region asia-southeast2 --allow-unauthenticated
   ```

---

## 🛡️ Keamanan & Privasi

- **Rate Limiting**: Maksimal 5 permintaan per 10 menit untuk mencegah abuse API.
- **Data Handling**: File diproses langsung di memori (RAM) dan tidak disimpan secara permanen di server.
- **Encrypted Session**: Menggunakan Firebase Auth untuk manajemen sesi pengguna yang aman.

---

## 📬 Kontak & Media Sosial

Kami sangat terbuka untuk diskusi, saran, atau kolaborasi. Hubungi kami melalui:

- **Instagram**: [@radeennndsp](https://instagram.com/radeennndsp)
- **Email**: [radeennndsp@gmail.com](mailto:radeennndsp@gmail.com)
- **GitHub**: [github.com/radeennndsp](https://github.com/radeennndsp)
- **Website**: [https://radeennndsp.vercel.app/](https://radeennndsp.vercel.app/)

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

---
