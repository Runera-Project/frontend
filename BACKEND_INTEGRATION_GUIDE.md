# 🔗 Panduan Integrasi Backend ke Frontend

**Backend URL**: https://backend-production-dfd3.up.railway.app  
**Status**: ✅ READY FOR INTEGRATION

---

## 📋 Environment Variables

### Yang Perlu Ditambahkan ke `.env.local`:

```bash
# ✅ SUDAH DITAMBAHKAN

# Backend API Configuration
NEXT_PUBLIC_API_URL=https://backend-production-dfd3.up.railway.app
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Smart Contract Addresses (Updated dari Backend)
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0x725d729107C4bC61f3665CE1C813CbcEC7214343
NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT=0x6941280D4aaFe1FC8Fe07506B50Aff541a1B8bD9
NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY=0xbb426df3f52701CcC82d0C771D6B3Ef5210db471
```

### ⚠️ JANGAN Tambahkan ke Frontend:

```bash
# ❌ INI HANYA UNTUK BACKEND - JANGAN MASUKKAN KE FRONTEND!
DATABASE_URL="..."
JWT_SECRET="..."
BACKEND_SIGNER_PRIVATE_KEY="..."
PORT=4000
CORS_ORIGIN="..."
```

**Alasan**: 
- `DATABASE_URL` - Credentials database, harus rahasia
- `JWT_SECRET` - Secret key untuk authentication
- `BACKEND_SIGNER_PRIVATE_KEY` - Private key untuk signing, SANGAT RAHASIA!
- `PORT` - Hanya untuk backend server
- `CORS_ORIGIN` - Konfigurasi backend

---

## 📁 File yang Sudah Dibuat

### 1. **`lib/api.ts`** ✅
API client untuk komunikasi dengan backend.

**Fungsi yang Tersedia**:
```typescript
// Profile
- requestUpdateStatsSignature(data) → Get signature untuk update stats

// Achievement
- requestClaimAchievementSignature(data) → Get signature untuk claim achievement

// Event
- joinEvent(data) → Join event

// Activity (GPS Tracking)
- startActivity(data) → Start tracking
- updateActivity(data) → Update GPS data
- endActivity(data) → End tracking dan get stats

// Health Check
- checkHealth() → Cek backend status
- isBackendAvailable() → Cek apakah backend online
```

---

## 🔧 Cara Menggunakan API

### 1. **Update Profile Stats**

```typescript
import { requestUpdateStatsSignature } from '@/lib/api';
import { useWriteContract } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';

// 1. Request signature dari backend
const { signature, deadline, stats } = await requestUpdateStatsSignature({
  userAddress: address,
  stats: {
    xp: 100,
    level: 1,
    runCount: 5,
    achievementCount: 2,
    totalDistanceMeters: 5000,
    longestStreakDays: 3,
    lastUpdated: Math.floor(Date.now() / 1000),
  },
});

// 2. Call smart contract dengan signature
await writeContract({
  address: CONTRACTS.ProfileNFT,
  abi: ABIS.ProfileNFT,
  functionName: 'updateStats',
  args: [address, stats, deadline, signature],
});
```

### 2. **Claim Achievement**

```typescript
import { requestClaimAchievementSignature } from '@/lib/api';

// 1. Request signature dari backend
const { signature, deadline, eventId, tier, metadataHash } = 
  await requestClaimAchievementSignature({
    userAddress: address,
    eventId: '0x...', // Achievement event ID
    tier: 1, // Bronze = 1, Silver = 2, dll
    metadataHash: '0x...', // IPFS hash
  });

// 2. Call smart contract
await writeContract({
  address: CONTRACTS.AchievementNFT,
  abi: ABIS.AchievementNFT,
  functionName: 'claim',
  args: [address, eventId, tier, metadataHash, deadline, signature],
});
```

### 3. **Join Event**

```typescript
import { joinEvent } from '@/lib/api';

// Join event (backend akan increment participant count)
const result = await joinEvent({
  userAddress: address,
  eventId: '0x...', // Event ID dari contract
});

console.log(result.message); // "Successfully joined event"
```

### 4. **GPS Tracking (Activity)**

```typescript
import { startActivity, updateActivity, endActivity } from '@/lib/api';

// 1. Start activity
const { activityId } = await startActivity({
  userAddress: address,
  activityType: 'run',
});

// 2. Update GPS data (setiap beberapa detik)
await updateActivity({
  activityId,
  gpsData: [
    {
      latitude: -6.2088,
      longitude: 106.8456,
      timestamp: Date.now(),
      accuracy: 10,
    },
    // ... more GPS points
  ],
});

// 3. End activity
const { stats, xpEarned } = await endActivity({
  activityId,
  userAddress: address,
});

console.log('Distance:', stats.distance, 'meters');
console.log('XP Earned:', xpEarned);
```

---

## 🎯 Integrasi per Fitur

### 1. **Profile Stats Update** (Priority: HIGH)

**File yang Perlu Diubah**:
- `app/record/validate/page.tsx` - Setelah validasi aktivitas
- Buat hook `hooks/useUpdateStats.ts`

**Flow**:
```
User selesai aktivitas
  ↓
Validasi GPS data
  ↓
Request signature dari backend
  ↓
Call updateStats() di contract
  ↓
Profile stats updated
```

### 2. **Claim Achievement** (Priority: HIGH)

**File yang Perlu Diubah**:
- `components/AchievementCard.tsx` - Tambah tombol "Claim"
- Buat hook `hooks/useClaimAchievement.ts`

**Flow**:
```
User unlock achievement
  ↓
Klik "Claim" button
  ↓
Request signature dari backend
  ↓
Call claim() di contract
  ↓
Achievement NFT minted
```

### 3. **Join Event** (Priority: MEDIUM)

**File yang Perlu Diubah**:
- `components/event/EventCard.tsx` - Tambah tombol "Join"
- `hooks/useEvents.ts` - Tambah joinEvent function

**Flow**:
```
User klik "Join Event"
  ↓
Call joinEvent() API
  ↓
Backend increment participant count
  ↓
User joined event
```

### 4. **GPS Tracking** (Priority: HIGH)

**File yang Perlu Diubah**:
- `app/record/page.tsx` - Integrate GPS tracking
- Buat hook `hooks/useGPSTracking.ts`

**Flow**:
```
User klik "Start"
  ↓
startActivity() → Get activityId
  ↓
Track GPS setiap 5 detik
  ↓
updateActivity() → Send GPS data
  ↓
User klik "Stop"
  ↓
endActivity() → Get stats & XP
  ↓
Show results
```

---

## 📊 Contract Addresses yang Diupdate

| Contract | Address Lama | Address Baru (dari Backend) |
|----------|--------------|------------------------------|
| ProfileNFT | `0xa26dD3d...` | `0x725d729...` ✅ |
| AchievementNFT | `0x761a26b...` | `0x6941280...` ✅ |
| EventRegistry | `0x0cDA043...` | `0xbb426df...` ✅ |
| CosmeticNFT | `0x18Aaa73...` | `0x18Aaa73...` (sama) |
| Marketplace | `0xc91263B...` | `0xc91263B...` (sama) |

**⚠️ PENTING**: Contract addresses sudah diupdate di `.env.local`!

---

## 🧪 Testing Backend Integration

### 1. **Test Health Check**

```typescript
import { checkHealth, isBackendAvailable } from '@/lib/api';

// Cek apakah backend online
const isOnline = await isBackendAvailable();
console.log('Backend online:', isOnline);

// Get health info
const health = await checkHealth();
console.log('Backend status:', health.status);
```

### 2. **Test Update Stats**

```bash
# Di browser console atau component
import { requestUpdateStatsSignature } from '@/lib/api';

const result = await requestUpdateStatsSignature({
  userAddress: '0x...',
  stats: {
    xp: 100,
    level: 1,
    runCount: 1,
    achievementCount: 0,
    totalDistanceMeters: 5000,
    longestStreakDays: 1,
    lastUpdated: Math.floor(Date.now() / 1000),
  },
});

console.log('Signature:', result.signature);
console.log('Deadline:', result.deadline);
```

---

## 🔐 Security Notes

### ✅ Yang AMAN untuk Frontend:

```bash
NEXT_PUBLIC_API_URL=https://...           # ✅ Public API URL
NEXT_PUBLIC_CHAIN_ID=84532                # ✅ Public chain ID
NEXT_PUBLIC_RPC_URL=https://...           # ✅ Public RPC
NEXT_PUBLIC_CONTRACT_*=0x...              # ✅ Public contract addresses
```

### ❌ Yang TIDAK BOLEH di Frontend:

```bash
DATABASE_URL="..."                        # ❌ Database credentials
JWT_SECRET="..."                          # ❌ Secret key
BACKEND_SIGNER_PRIVATE_KEY="..."          # ❌ Private key (SANGAT RAHASIA!)
```

**Alasan**: 
- Frontend code bisa dilihat siapa saja di browser
- Private key jika bocor = semua ETH bisa dicuri!
- Database credentials jika bocor = database bisa dihack

---

## 📝 Checklist Integrasi

### Setup:
- [x] Update `.env.local` dengan backend URL
- [x] Update contract addresses dari backend
- [x] Buat `lib/api.ts` untuk API client
- [ ] Test health check
- [ ] Test API calls

### Fitur:
- [ ] Integrate update stats (Record page)
- [ ] Integrate claim achievement (Profile page)
- [ ] Integrate join event (Event page)
- [ ] Integrate GPS tracking (Record page)

### Testing:
- [ ] Test update stats flow
- [ ] Test claim achievement flow
- [ ] Test join event flow
- [ ] Test GPS tracking flow
- [ ] Test error handling

---

## 🚀 Next Steps

### 1. **Test Backend Connection** (5 menit)
```typescript
// Di any component
import { isBackendAvailable } from '@/lib/api';

useEffect(() => {
  async function test() {
    const online = await isBackendAvailable();
    console.log('Backend online:', online);
  }
  test();
}, []);
```

### 2. **Implement Update Stats** (1-2 jam)
- Buat hook `useUpdateStats.ts`
- Integrate di Record/Validate page
- Test dengan aktivitas real

### 3. **Implement Claim Achievement** (1-2 jam)
- Buat hook `useClaimAchievement.ts`
- Tambah button di AchievementCard
- Test claim flow

### 4. **Implement GPS Tracking** (2-3 jam)
- Buat hook `useGPSTracking.ts`
- Integrate di Record page
- Test tracking real-time

---

## 📚 Resources

- **Backend URL**: https://backend-production-dfd3.up.railway.app
- **API Docs**: (Tanya backend dev untuk Swagger/Postman)
- **Contract Explorer**: https://sepolia.basescan.org
- **RPC URL**: https://sepolia.base.org

---

**Status**: ✅ READY - Environment variables sudah configured!  
**Next**: Test backend connection dan mulai integrate fitur! 🚀
