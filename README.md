# 💍 Undangan Pernikahan Digital — Fira & Sodik

Website undangan pernikahan digital yang elegan, interaktif, dan responsif untuk pernikahan **Fira Agustin & Sodik Prastio**.

---

## 🌐 Link Publikasi (Live Demo)
👉 **Website Resmi Undangan:**  
**[https://undangan-fira-sodik.vercel.app/](https://undangan-fira-sodik.vercel.app/)**

---

## ✨ Fitur Utama

- **Cover & Personalised Guest Name:** Mendukung personalisasi nama tamu undangan secara dinamis via query parameter URL (contoh: `?to=Nama+Tamu`).
- **Background Music Player:** Musik latar romantis (*Wedding Harp*) dengan kontrol interaktif Play/Pause.
- **Hitung Mundur (Countdown Timer):** Penghitung waktu otomatis menuju hari bahagia (Sabtu, 31 Oktober 2026).
- **Profil Mempelai:** Kartu profil mempelai wanita & pria beserta info keluarga dan tautan media sosial.
- **Kisah Cinta (Love Journey):** Linimasa perjalanan cinta dari awal perkenalan hingga menuju pelaminan.
- **Detail Acara (Akad & Resepsi):** Lengkap dengan waktu, lokasi, serta integrasi tombol **Buka Google Maps** dan **Simpan ke Google Calendar**.
- **RSVP & Buku Doa/Ucapan Online:** Formulir konfirmasi kehadiran tamu terintegrasi dengan Google Apps Script backend (`gas-backend.gs`) dan Firebase.
- **Amplop Digital / Hadiah:** Informasi nomor rekening & dompet digital dengan fitur salin nomor rekening sekali klik.
- **Desain Mewah & Responsif:** Tampilan optimal di perangkat smartphone, tablet, maupun desktop dengan efek animasi lembut.

---

## 📂 Struktur Proyek

```text
wedding-invitation/
├── assets/
│   ├── audio/
│   │   └── wedding-harp.mp3        # Musik latar undangan
│   └── images/
│       ├── bg.png                  # Background ornamen
│       ├── card-bg.jpg             # Background kartu
│       ├── coverdepan.png          # Foto sampul utama
│       ├── fira.png                # Foto mempelai wanita
│       ├── sodik.png               # Foto mempelai pria
│       ├── frame.jpg               # Ornamen bingkai
│       └── preview-undangan.jpg    # Gambar Open Graph / preview medsos
├── css/
│   ├── animations.css              # Efek animasi CSS
│   ├── components.css              # Styling komponen (kartu, tombol, form)
│   └── main.css                    # Styling global & layout
├── js/
│   ├── animations.js               # Logika trigger scroll & animasi
│   ├── countdown.js                # Logika hitung mundur waktu
│   ├── firebase-config.js          # Konfigurasi database ucapan
│   ├── gallery.js                  # Logika preview galeri foto
│   ├── main.js                     # Inisialisasi utama, audio, & navigasi
│   ├── rsvp.js                     # Pengelolaan formulir RSVP & pesan
│   └── sheets-api.js               # Integrasi Google Apps Script
├── gas-backend.gs                  # Script backend Google Sheets untuk data RSVP
├── index.html                      # Halaman web utama
└── README.md                       # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/whoiaiiis/undangan-fira-sodik.git
   cd undangan-fira-sodik
   ```

2. **Buka langsung di browser:**
   Cukup klik dua kali berkas `index.html`, atau gunakan ekstensi seperti **Live Server** di VS Code.

3. **Format Pengiriman Tautan Tamu:**
   Untuk menyapa tamu tertentu secara otomatis di halaman sampul:
   ```text
   https://undangan-fira-sodik.vercel.app/?to=Bapak+Budi+dan+Keluarga
   ```

---

## 🛠️ Teknologi yang Digunakan

- **HTML5 & CSS3:** Semantic markup, CSS Custom Properties, Flexbox & Grid, CSS Keyframe Animations.
- **JavaScript (Vanilla ES6+):** Audio Controller, URL Parameter Parser, Countdown Engine, Async Fetch API.
- **Google Apps Script:** Pengiriman data form RSVP langsung ke Google Spreadsheet.
- **Hosting / Deploy:** [Vercel](https://vercel.com).

---

## 👤 Author

Dikembangkan oleh **[Aisyah Arianti (whoiaiiis)](https://github.com/whoiaiiis)**.
