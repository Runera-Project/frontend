# 🔐 Session Persistence - Penjelasan Lengkap

## ✅ Cara Kerja Session

### Flow Pertama Kali (Belum Login)
```
1. User buka app (localhost:3000)
   ↓
2. AuthGuard check: authenticated = false
   ↓
3. Redirect ke /login
   ↓
4. User klik "Sign In"
   ↓
5. Privy modal muncul (email/google/wallet)
   ↓
6. User login
   ↓
7. Privy save session:
   - Access token → localStorage
   - Refresh token → httpOnly cookies
   - User data → localStorage
   ↓
8. Redirect ke home (/)
   ↓
9. ✅ User sudah login
```

### Flow Setelah Login (Session Persist)
```
1. User buka app lagi (refresh/close/reopen)
   ↓
2. AuthGuard check localStorage untuk token
   ↓
3. Token ditemukan & valid?
   ↓
   YES → authenticated = true
   ↓
   ✅ Langsung masuk app (tidak perlu login lagi)
   
   NO → Token expired?
   ↓
   Check refresh token di cookies
   ↓
   Refresh token valid?
   ↓
   YES → Auto-refresh access token
   ↓
   ✅ Tetap login
   
   NO → Refresh token expired (> 30 hari)
   ↓
   ❌ Redirect ke /login
```

---

## 🔍 Privy Session Storage

### 1. LocalStorage (Browser)
```javascript
// Check di DevTools → Application → Local Storage
privy:token              // Access token (valid 1 jam)
privy:refresh_token      // Refresh token (valid 30 hari)
privy:user              // User data (email, wallet, dll)
privy:connections       // Connected wallets
```

### 2. Cookies (httpOnly)
```javascript
// Check di DevTools → Application → Cookies
privy-session           // Session ID
privy-refresh           // Refresh token (secure, httpOnly)
privy-id-token          // ID token
```

### 3. IndexedDB (Encrypted)
```javascript
// Check di DevTools → Application → IndexedDB
privy-wallets           // Encrypted wallet keys
```

---

## ⏰ Token Lifecycle

### Access Token (1 jam)
```
Login → Get access token (valid 1 jam)
  ↓
After 55 minutes → Privy auto-refresh
  ↓
Request refresh token ke Privy API
  ↓
Get new access token (valid 1 jam lagi)
  ↓
Update localStorage
  ↓
User tetap login (seamless)
```

### Refresh Token (30 hari)
```
Login → Get refresh token (valid 30 hari)
  ↓
Stored in httpOnly cookies (secure)
  ↓
Used to refresh access token
  ↓
After 30 hari → Expired
  ↓
User harus login ulang
```

---

## 🧪 Testing Session Persistence

### Test 1: Refresh Page
```bash
1. Login ke app
2. Refresh page (F5 atau Ctrl+R)
3. ✅ Tetap login, tidak redirect ke /login
4. ✅ User data masih ada
```

### Test 2: Close & Reopen Browser
```bash
1. Login ke app
2. Close browser completely
3. Reopen browser
4. Buka app lagi (localhost:3000)
5. ✅ Tetap login, tidak perlu login lagi
```

### Test 3: Multiple Tabs
```bash
1. Login di tab 1
2. Buka tab 2 dengan URL yang sama
3. ✅ Tab 2 sudah login otomatis
4. Logout di tab 1
5. ✅ Tab 2 juga logout otomatis
```

### Test 4: After 1 Hour (Token Refresh)
```bash
1. Login ke app
2. Tunggu 1 jam (atau manipulasi token expiry)
3. ✅ Token auto-refresh
4. ✅ User tetap login tanpa interrupt
5. Check console: "Token refreshed"
```

### Test 5: After 30 Days (Session Expired)
```bash
1. Login ke app
2. Tunggu 30 hari (atau clear cookies)
3. Refresh page
4. ❌ Redirect ke /login
5. User harus login ulang
```

---

## 🔧 Troubleshooting

### Problem 1: User Logout Otomatis Setelah Refresh

**Kemungkinan Penyebab**:
1. Browser clear cookies/localStorage
2. Incognito/Private mode
3. Browser extension (ad blocker, privacy tools)
4. Network error saat refresh token

**Solusi**:
```bash
# Check localStorage
1. Buka DevTools → Application → Local Storage
2. Cari key: privy:token, privy:refresh_token
3. Jika tidak ada → Session cleared

# Check cookies
1. Buka DevTools → Application → Cookies
2. Cari: privy-session, privy-refresh
3. Jika tidak ada → Cookies cleared

# Check console
1. Buka DevTools → Console
2. Cari error: "Token refresh failed"
3. Jika ada → Network issue atau Privy API down
```

### Problem 2: Token Refresh Gagal

**Kemungkinan Penyebab**:
1. Network error (offline)
2. Privy API down
3. Refresh token expired
4. CORS issue

**Solusi**:
```typescript
// Add error handling di providers.tsx
<PrivyProvider
  onError={(error) => {
    console.error('Privy error:', error);
    if (error.message.includes('refresh')) {
      // Token refresh failed
      alert('Session expired. Please login again.');
    }
  }}
>
```

### Problem 3: Session Tidak Sync Antar Tab

**Kemungkinan Penyebab**:
1. localStorage tidak sync
2. Cookies tidak shared
3. Browser issue

**Solusi**:
```typescript
// Add storage event listener
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'privy:token' && !e.newValue) {
      // Token removed, logout
      window.location.href = '/login';
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

---

## 📊 Session Status Check

### Check di Console
```typescript
// Paste di browser console
console.log('Privy Session:', {
  token: localStorage.getItem('privy:token'),
  refreshToken: localStorage.getItem('privy:refresh_token'),
  user: localStorage.getItem('privy:user'),
  cookies: document.cookie,
});
```

### Check di Component
```typescript
import { usePrivy } from '@privy-io/react-auth';

function SessionDebug() {
  const { ready, authenticated, user } = usePrivy();
  
  useEffect(() => {
    console.log('Session Status:', {
      ready,
      authenticated,
      userId: user?.id,
      email: user?.email?.address,
      wallet: user?.wallet?.address,
    });
  }, [ready, authenticated, user]);
  
  return null;
}
```

---

## ✅ Checklist Session Persistence

- [x] Privy session enabled
- [x] Token auto-refresh configured
- [x] Refresh token valid 30 hari
- [x] localStorage untuk token
- [x] httpOnly cookies untuk refresh token
- [x] AuthGuard check authentication
- [x] Redirect ke /login jika not authenticated
- [x] No forced logout on refresh
- [x] Multiple tabs support

---

## 🎯 Expected Behavior

### ✅ Yang Seharusnya Terjadi:
1. **Pertama kali** → Harus login via Privy
2. **Setelah login** → Tetap login sampai 30 hari
3. **Refresh page** → Tetap login
4. **Close/reopen browser** → Tetap login
5. **Multiple tabs** → Tetap login
6. **After 1 hour** → Token auto-refresh, tetap login
7. **After 30 days** → Session expired, harus login ulang

### ❌ Yang TIDAK Seharusnya Terjadi:
1. Logout otomatis setelah refresh
2. Diminta login lagi setelah close browser
3. Token tidak refresh otomatis
4. Session tidak sync antar tab

---

## 🔐 Security Notes

### Token Security:
- ✅ Access token di localStorage (OK untuk web apps)
- ✅ Refresh token di httpOnly cookies (secure, tidak bisa diakses JS)
- ✅ Wallet keys encrypted di IndexedDB
- ✅ HTTPS required untuk production

### Best Practices:
- ✅ Token rotation (refresh token rotate setiap kali digunakan)
- ✅ Short-lived access token (1 jam)
- ✅ Long-lived refresh token (30 hari)
- ✅ Secure cookies (httpOnly, SameSite)

---

**Status**: ✅ SESSION PERSISTENCE ACTIVE  
**Duration**: 30 days  
**Auto-refresh**: Every 55 minutes  
**Storage**: localStorage + httpOnly cookies  
**Ready**: YES

Privy sudah handle session persistence dengan baik. User hanya perlu login sekali, dan akan tetap login sampai 30 hari! 🎉
