---
version: alpha
name: TruthLens AI
description: |
  Antarmuka TruthLens AI berdiri di atas kanvas hitam murni (#000000) dengan
  teks off-white dan satu warna aksen signature — tipografi serif Domaine
  Display yang dalam — memberikan kesan "Editorial Forensik" yang berwibawa.
  Sistem ini menggabungkan Domaine Display (oversized headline) dengan Inter
  untuk UI fungsional, menciptakan kontras antara estetika majalah cetak 
  dan alat teknis investigasi digital.

colors:
  primary: "#fcfdff"
  primary-on: "#000000"
  ink: "#fcfdff"
  body: "rgba(252,253,255,0.86)"
  charcoal: "rgba(252,253,255,0.7)"
  mute: "#a1a4a5"
  canvas: "#000000"
  surface-card: "#0a0a0c"
  surface-elevated: "#101012"
  surface-deep: "#06060a"
  hairline: "rgba(255,255,255,0.06)"
  hairline-strong: "rgba(255,255,255,0.14)"
  accent-blue: "#3b9eff"
  accent-blue-glow: "rgba(0,117,255,0.22)"
  accent-orange: "#ff801f"
  accent-orange-glow: "rgba(255,128,31,0.18)"
  accent-green: "#11ff99"
  accent-red: "#ff2047"

typography:
  display-xxl:
    fontFamily: Domaine Display
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.96px
  heading-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  code-md:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: 400

rounded:
  md: 8px
  lg: 12px
  full: 9999px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-on}"
    rounded: "{rounded.md}"
    padding: 8px 16px
  forensic-dossier:
    backgroundColor: "{colors.surface-card}"
    borderColor: "{colors.hairline-strong}"
    rounded: "{rounded.lg}"
  scan-glow:
    gradient: "radial-gradient(at top, {colors.accent-blue-glow}, transparent)"

---

## Overview

TruthLens AI dirancang untuk terlihat seperti alat investigasi pemerintah namun dengan estetika editorial modern. Setiap halaman dibuka pada `{colors.canvas}` (#000000), di mana elemen terkuat adalah headline **Domaine Display** 96px yang memberikan kesan otoritas dan kebenaran mutlak.

Kedalaman permukaan dibangun hampir seluruhnya dari putih translusen — border 6% hairlines dan 14% strong borders — di atas lapisan `{colors.surface-deep}`. Tidak ada bayangan tradisional (drop-shadow); sistem ini menggunakan **atmospheric glows** (biru dan oranye) dengan opasitas rendah untuk menciptakan dimensi tanpa mengganggu fokus pada bukti digital.

## Colors

### Surface & Elevation
- **Canvas** (`{colors.canvas}`): Hitam murni, melambangkan kedalaman data yang belum terungkap.
- **Surface Card** (`{colors.surface-card}`): Digunakan untuk panel Dossier dan pratinjau bukti, memberikan pemisahan halus dari kanvas.
- **Hairline Strong** (`{colors.hairline-strong}`): Border 1px 14% putih yang menjadi satu-satunya indikator struktur fisik elemen di layar.

### Semantic Accents
- **Forensic Blue** (`{colors.accent-blue}`): Warna default untuk pemindaian yang sedang berlangsung dan link teknis.
- **Alert Red** (`{colors.accent-red}`): Digunakan secara eksklusif untuk temuan risiko tinggi (Deepfake/Manipulasi).
- **Integrity Green** (`{colors.accent-green}`): Digunakan untuk indikator file asli dan skor kepercayaan tinggi.

## Typography Principles
- **Domaine Display**: Harus selalu menggunakan `lineHeight: 1.0` dengan letter-spacing negatif. Headline harus terasa seperti blok padat yang tidak tertembus.
- **Geist Mono**: Digunakan untuk semua representasi data mentah, metadata EXIF, dan log AI guna memberikan kesan teknis yang presisi.

## Elevation & Depth
Sistem ini menolak penggunaan bayangan (shadow). Kedalaman dicapai melalui:
1. **Luminansi**: Elemen yang lebih penting memiliki latar belakang sedikit lebih terang (`{colors.surface-elevated}`).
2. **Glow**: Radial wash di bagian atas seksi (misalnya saat menampilkan hasil scan) menggunakan `{colors.accent-blue-glow}`.

## Do's and Don'ts

### Do
- Gunakan `#000000` murni sebagai latar belakang dasar.
- Pastikan headline Domaine Display selalu rapat (`lineHeight: 1.0`).
- Gunakan border hairlines translusen untuk memisahkan konten.

### Don't
- Jangan gunakan drop-shadow tradisional.
- Jangan gunakan gradien warna solid yang mencolok; gunakan glow transparan.
- Jangan gunakan warna aksen sebagai latar belakang tombol kecuali putih (`{colors.primary}`).
