# ⚡ ARJUN RAJPUT • BILIBILI DOWNLOADER
### 🔥 Powered by ZYROX Architecture

Next-Gen Web Video & Audio Downloader for Bilibili (`bilibili.com`, `b23.tv`, `bilibili.tv`).
Supports **1080p Full HD**, **720p HD**, **480p SD**, and **320kbps MP3 Audio** with **Zero Watermark**.

---

## 🌟 Key Features

- 🚫 **Zero Watermark:** Direct Desktop CDN stream bypass removes app watermarks and outro cards.
- ⚡ **All Resolutions:** 1080p, 720p, 480p, 360p, and MP3 audio stream extraction.
- 🚀 **1-Click Download:** Streaming proxy with auto-attachment headers directly to user's device.
- 🎨 **Modern Cyberpunk UI:** Glassmorphism, neon cyan & purple accents, glowing badges, responsive on Mobile & Desktop.
- ☁️ **Vercel Optimized:** Serverless functions (`/api/parse`, `/api/download`) with zero heavy dependencies.

---

## 🚀 How to Deploy on Vercel (1-Click)

### Method 1: Deploy via GitHub (Recommended)
1. Is folder ke saare files ko apne GitHub repository me push karein.
2. [Vercel Dashboard](https://vercel.com/new) par jayein.
3. Apna GitHub repo select karke **Import** karein.
4. **Framework Preset:** `Other` (Default)
5. **Deploy** button dabayein! Vercel automatically `vercel.json` aur `/api` serverless routes configure kar dega.

### Method 2: Deploy via Vercel CLI
Apne terminal ya Termux me:
```bash
npm install -g vercel
vercel
```

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local server
npm start
# Server opens at http://localhost:3000
```

---

## 📁 Project Structure

```
zyrox-web/
├── api/
│   ├── parse.js        # Vercel Serverless Function (Extracts Bilibili metadata & all format qualities)
│   └── download.js     # Vercel Serverless Function (Direct stream proxy & 1-click file download)
├── public/
│   ├── index.html      # Modern Glassmorphic Frontend UI
│   ├── style.css       # Neon Cyberpunk Dark Theme Styles
│   └── app.js          # Interactive controller & format renderer
├── vercel.json         # Vercel Serverless Routing Config
├── package.json        # Node.js project manifest
├── server.js           # Local express preview server
└── README.md           # Deployment documentation
```

---

**Designed & Developed for ARJUN RAJPUT** • **Engineered by ZYROX**
