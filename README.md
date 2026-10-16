# ☀️ Royal Eye Solar Power – Work Progress & Status Tracker

Live solar installation project tracker for Kerala rooftop solar installations, integrated with PM Surya Ghar Muft Bijli Yojana subsidy workflows.

GitHub Repository: [https://github.com/supportroyaleyesolar/royal-eye-pending-works](https://github.com/supportroyaleyesolar/royal-eye-pending-works)

---

## 🏛️ 7-Pillar Free Hosting Architecture

```
1. GITHUB             -> Code Repository, Version Control & CI/CD trigger
2. SUPABASE           -> Live Cloud PostgreSQL Database & Real-time WebSockets
3. NETLIFY            -> Web Hosting, Global CDN & Automated Deployment (100% Free)
4. NODE.JS (server.js)-> Local Development / Production Server (localhost:3000)
5. HTML5 LOCALSTORAGE -> Offline Browser Cache & Resilience Fallback (0ms instant boot)
6. WHATSAPP API / WEB -> 1-Click Client Quotations & Marketing Pitch Delivery
7. JSDELIVR / CDN     -> High-speed external JS libraries, fonts & icon bundles
```

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run Vite local dev server (Hot Module Reloading)
npm run dev           # http://localhost:5173

# 3. Or run the dedicated Node.js production server
npm run build         # compiles to /dist
npm run serve         # http://localhost:3000
```

---

## 🌐 Deploy to Netlify (100% Free Hosting)

1. Log into **[Netlify](https://app.netlify.com)** (Free Tier).
2. Click **"Add new site"** → **"Import an existing project"**.
3. Select **GitHub** and authorize your account.
4. Pick repository: **`supportroyaleyesolar/royal-eye-pending-works`**.
5. Build settings will automatically detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Deploy Site**. Netlify will automatically build and publish with a free HTTPS URL (e.g. `royal-eye-solar.netlify.app`), with automated redeploy on every future git push!

---

## 🗄️ Supabase Cloud Database & Real-Time Sync (Optional)

1. Create a free project at **[Supabase](https://supabase.com)**.
2. Go to **SQL Editor** → Click **New Query**.
3. Copy and run the script in **`supabase-schema.sql`** (creates `customers` & `works` tables with Realtime WebSockets enabled).
4. In the Royal Eye web app, go to **Settings** → **Cloud DB & Hosting**:
   - Paste your **Supabase URL** and **Anon Key**.
   - Click **Test Connection** & **Sync Local Customers to Cloud**.
5. When offline, the app seamlessly falls back to **HTML5 LocalStorage** with zero downtime.

---

## 📱 1-Click WhatsApp Delivery

- **Rooftop Solar Quotation:** Generates a complete Kerala Rooftop proposal with PM Surya Ghar subsidy details (₹78,000 for 3 kW), net investment, KSEB bill savings, and contact details.
- **Milestone Updates:** Sends real-time installation progress and KSEB stage status directly to the customer's phone.
