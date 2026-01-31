# 📱 MOBILE LOCAL TESTING GUIDE

## 🎯 Cara Test Runera di Mobile (Local Development)

Ada 3 metode untuk test di mobile:

---

## 🔥 METHOD 1: Ngrok (Paling Mudah & Recommended)

### Step 1: Install Ngrok

**Windows:**
```bash
# Download dari https://ngrok.com/download
# Atau pakai chocolatey:
choco install ngrok
```

**Atau pakai npm:**
```bash
npm install -g ngrok
```

### Step 2: Start Dev Server

```bash
npm run dev
# atau
pnpm dev
```

Server akan jalan di `http://localhost:3000`

### Step 3: Expose dengan Ngrok

**Buka terminal baru:**
```bash
ngrok http 3000
```

**Output:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Akses dari Mobile

1. Copy URL ngrok: `https://abc123.ngrok.io`
2. Buka di browser mobile
3. Done! ✅

**Keuntungan:**
- ✅ HTTPS otomatis (penting untuk GPS & wallet)
- ✅ Bisa diakses dari mana saja
- ✅ Tidak perlu config network
- ✅ Support hot reload

**Kekurangan:**
- ⚠️ URL berubah setiap restart (free tier)
- ⚠️ Perlu internet

---

## 🌐 METHOD 2: Local Network (Tanpa Internet)

### Step 1: Cek IP Address Komputer

**Windows:**
```bash
ipconfig
```

Cari **IPv4 Address** di WiFi adapter, contoh: `192.168.1.100`

### Step 2: Update Next.js Config

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow access from any host (for mobile testing)
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
};

export default nextConfig;
```

### Step 3: Start Dev Server dengan Host

```bash
# Windows CMD
set HOST=0.0.0.0 && npm run dev

# Windows PowerShell
$env:HOST="0.0.0.0"; npm run dev

# Atau langsung:
npm run dev -- -H 0.0.0.0
```

### Step 4: Akses dari Mobile

1. Pastikan mobile dan PC di **WiFi yang sama**
2. Buka browser mobile
3. Akses: `http://192.168.1.100:3000` (ganti dengan IP Anda)

**Keuntungan:**
- ✅ Tidak perlu internet
- ✅ Tidak perlu install tools tambahan
- ✅ Cepat

**Kekurangan:**
- ❌ HTTP only (GPS mungkin tidak jalan)
- ❌ Wallet connect mungkin bermasalah
- ❌ Harus di network yang sama

---

## 🔒 METHOD 3: Local HTTPS (Paling Aman)

### Step 1: Install mkcert

**Windows (Chocolatey):**
```bash
choco install mkcert
```

**Atau download dari:** https://github.com/FiloSottile/mkcert/releases

### Step 2: Setup Local CA

```bash
mkcert -install
```

### Step 3: Generate Certificate

```bash
# Di root project
mkcert localhost 192.168.1.100 *.local
```

Akan generate:
- `localhost+2.pem` (certificate)
- `localhost+2-key.pem` (private key)

### Step 4: Update package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "node server.js"
  }
}
```

### Step 5: Create HTTPS Server

Create `server.js`:

```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port}`);
    console.log(`> Ready on https://192.168.1.100:${port}`);
  });
});
```

### Step 6: Run HTTPS Server

```bash
npm run dev:https
```

### Step 7: Akses dari Mobile

1. Akses: `https://192.168.1.100:3000`
2. Accept certificate warning (first time)
3. Done! ✅

**Keuntungan:**
- ✅ HTTPS (GPS & wallet work)
- ✅ Tidak perlu internet
- ✅ Seperti production

**Kekurangan:**
- ⚠️ Setup lebih kompleks
- ⚠️ Perlu accept certificate di mobile

---

## 🎯 RECOMMENDED SETUP

### For Quick Testing: **METHOD 1 (Ngrok)**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

Copy URL ngrok dan buka di mobile!

### For GPS Testing: **METHOD 1 or 3**

GPS API requires HTTPS, jadi pakai:
- Ngrok (otomatis HTTPS) ✅
- Local HTTPS (manual setup) ✅
- ❌ JANGAN pakai HTTP biasa

---

## 📱 MOBILE WALLET SETUP

### MetaMask Mobile

1. Install MetaMask app
2. Import wallet dengan seed phrase yang sama
3. Add Base Sepolia network:
   - Network Name: Base Sepolia
   - RPC URL: `https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
   - Chain ID: 84532
   - Currency: ETH
   - Block Explorer: https://sepolia.basescan.org

### WalletConnect (Alternative)

Jika pakai Privy, WalletConnect sudah built-in:
1. Klik "Connect Wallet"
2. Pilih WalletConnect
3. Scan QR code dengan mobile wallet

---

## 🧪 TESTING CHECKLIST

### Before Testing:

- [ ] Dev server running
- [ ] Mobile dan PC di network yang sama (Method 2/3)
- [ ] Atau ngrok running (Method 1)
- [ ] Mobile wallet installed & configured
- [ ] GPS enabled di mobile
- [ ] HTTPS enabled (untuk GPS)

### Test Flow:

1. [ ] Buka app di mobile browser
2. [ ] Connect wallet
3. [ ] Sign authentication message
4. [ ] Register profile (if needed)
5. [ ] Start GPS tracking
6. [ ] Record run
7. [ ] Submit run
8. [ ] Check transaction on BaseScan

---

## 🐛 TROUBLESHOOTING

### GPS Tidak Jalan

**Problem**: "Geolocation not available"

**Solution**:
- Pastikan pakai HTTPS (ngrok atau local HTTPS)
- Enable location permission di browser
- Test di Chrome mobile (paling reliable)

### Wallet Tidak Connect

**Problem**: MetaMask tidak muncul

**Solution**:
- Pakai MetaMask mobile app browser (in-app browser)
- Atau pakai WalletConnect
- Pastikan network sudah ditambahkan

### Hot Reload Tidak Jalan

**Problem**: Perubahan code tidak muncul

**Solution**:
- Refresh manual di mobile
- Atau restart dev server
- Clear browser cache

### CORS Error

**Problem**: "Access blocked by CORS"

**Solution**:
Update `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## 💡 TIPS

### 1. Use Chrome DevTools for Mobile

```bash
# Di Chrome desktop:
chrome://inspect
```

Connect mobile via USB untuk debug!

### 2. Test GPS di Desktop Dulu

Chrome DevTools → Sensors → Location
Set custom location untuk test

### 3. Keep Ngrok URL

Ngrok free tier URL berubah setiap restart.
Upgrade ke paid ($8/month) untuk fixed URL.

### 4. Use QR Code

Generate QR code untuk URL:
```bash
npm install -g qrcode-terminal
qrcode-terminal "https://abc123.ngrok.io"
```

Scan dengan mobile!

---

## 🚀 QUICK START SCRIPT

Create `mobile-dev.sh`:

```bash
#!/bin/bash

echo "🚀 Starting Runera Mobile Development..."

# Start dev server in background
npm run dev &

# Wait for server to start
sleep 5

# Start ngrok
ngrok http 3000
```

Run:
```bash
chmod +x mobile-dev.sh
./mobile-dev.sh
```

---

## 📊 PERFORMANCE TIPS

### 1. Disable Source Maps (Faster Load)

```typescript
// next.config.ts
const nextConfig = {
  productionBrowserSourceMaps: false,
};
```

### 2. Enable Turbopack (Faster Build)

```bash
npm run dev --turbo
```

### 3. Reduce Bundle Size

Check bundle:
```bash
npm run build
npm run analyze
```

---

## ✅ READY TO TEST!

**Recommended Flow:**

1. Start dev server: `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Copy ngrok URL
4. Open di mobile browser
5. Connect wallet
6. Test GPS tracking
7. Submit run
8. Verify on BaseScan

**Happy Testing!** 🎉
