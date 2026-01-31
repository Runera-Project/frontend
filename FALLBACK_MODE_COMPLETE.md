# 🔄 Fallback Mode - Complete Guide

## Overview

Aplikasi sekarang memiliki **fallback mode** untuk semua fitur yang memerlukan backend. Ini memungkinkan aplikasi tetap berfungsi meskipun backend belum selesai atau sedang down.

---

## 🎯 Fitur dengan Fallback Mode

### 1. GPS Tracking ✅
**Backend Endpoint**: `/api/activities/start`, `/api/activities/update`, `/api/activities/end`

**Fallback**: Local tracking dengan perhitungan stats di frontend

**Cara Kerja**:
- Jika backend tidak tersedia → Generate local activity ID
- GPS data disimpan di memory (tidak dikirim ke backend)
- Stats dihitung lokal saat stop tracking
- XP: 1 XP per 100 meters

**Console Log**:
```
Backend not available, using local tracking: HTTP 404
Local activity started: local-1769714179799-0x439069
GPS point recorded: {...}
Ending local activity...
Local activity ended: { stats: {...}, xpEarned: 0 }
```

---

### 2. Save Activity ✅
**Backend Endpoint**: `/api/profile/update-stats`

**Fallback**: Save to localStorage

**Cara Kerja**:
- Try update stats via backend
- Jika backend tidak tersedia → Save to localStorage
- Data disimpan di `runera_activities` key
- Alert menginformasikan user bahwa data disimpan lokal

**LocalStorage Structure**:
```json
[
  {
    "id": 1769714179966,
    "title": "Morning Run",
    "distance": 0.5,
    "duration": 300,
    "pace": "10:00",
    "xpEarned": 50,
    "timestamp": 1769714179966
  }
]
```

**Alert Message**:
```
Activity saved locally! +50 XP earned! 🎉

Note: Backend unavailable, data saved to browser only.
```

---

### 3. Join Event (Coming Soon)
**Backend Endpoint**: `/api/events/join`

**Fallback**: Save to localStorage

**Cara Kerja**:
- Try join event via backend
- Jika backend tidak tersedia → Save to localStorage
- Mark event as "joined" locally

---

### 4. Claim Achievement (Coming Soon)
**Backend Endpoint**: `/api/achievements/claim`

**Fallback**: Direct smart contract call (no signature)

**Cara Kerja**:
- Try get signature from backend
- Jika backend tidak tersedia → Skip signature verification
- Call smart contract directly (will fail if contract requires signature)

---

## 📊 Data Storage

### LocalStorage Keys

| Key | Purpose | Structure |
|-----|---------|-----------|
| `runera_activities` | Saved activities | Array of activity objects |
| `runera_joined_events` | Joined events | Array of event IDs |
| `runera_claimed_achievements` | Claimed achievements | Array of achievement IDs |

### Example Data

```javascript
// Activities
localStorage.getItem('runera_activities')
// [{"id":1769714179966,"title":"Morning Run","distance":0.5,...}]

// Joined Events
localStorage.getItem('runera_joined_events')
// ["event_123", "event_456"]

// Claimed Achievements
localStorage.getItem('runera_claimed_achievements')
// ["ach_first_run", "ach_5km"]
```

---

## 🔍 Deteksi Mode

### GPS Tracking
```typescript
if (activityId.startsWith('local-')) {
  // Local mode
} else {
  // Backend mode
}
```

### Save Activity
```typescript
try {
  await updateStats(newStats);
  // Backend mode
} catch (error) {
  // Fallback to localStorage
}
```

---

## ⚠️ Limitasi Fallback Mode

### 1. Data Tidak Persistent
- Data hanya disimpan di browser
- Clear cache = data hilang
- Tidak sync antar device

### 2. Tidak Ada Validasi
- XP bisa di-manipulasi
- GPS data tidak diverifikasi
- Tidak ada anti-cheat

### 3. Tidak Ada Signature
- Smart contract call tanpa signature akan gagal
- Achievement claim tidak bisa dilakukan
- Profile update tidak bisa dilakukan

### 4. Tidak Ada Leaderboard
- Data lokal tidak masuk leaderboard
- Tidak bisa compare dengan user lain

---

## 🚀 Migration ke Backend Mode

Ketika backend sudah ready, data lokal bisa di-migrate:

### 1. Read LocalStorage
```typescript
const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
```

### 2. Send to Backend
```typescript
for (const activity of activities) {
  await fetch('/api/activities/migrate', {
    method: 'POST',
    body: JSON.stringify(activity),
  });
}
```

### 3. Clear LocalStorage
```typescript
localStorage.removeItem('runera_activities');
```

---

## 🧪 Testing

### Test Fallback Mode
1. Matikan backend atau gunakan backend yang belum implement endpoint
2. Start tracking → Akan menggunakan local mode
3. Stop tracking → Stats dihitung lokal
4. Save activity → Data disimpan ke localStorage
5. Check localStorage di DevTools

### Test Backend Mode
1. Pastikan backend online dan implement semua endpoint
2. Start tracking → Akan menggunakan backend mode
3. Stop tracking → Stats dari backend
4. Save activity → Data disimpan ke backend
5. Check database di backend

---

## 📝 Console Logs

### Fallback Mode Active
```
Starting activity with backend...
Backend not available, using local tracking: HTTP 404
Local activity started: local-1769714179799-0x439069
GPS point recorded: {...}
Ending local activity...
Local activity ended: {...}
Requesting signature from backend...
Backend not available, saving locally: HTTP 404
Activity saved to localStorage
```

### Backend Mode Active
```
Starting activity with backend...
Backend activity started: act_123456
GPS point recorded: {...}
GPS data sent to backend
Ending activity with backend...
Backend activity ended: {...}
Requesting signature from backend...
Signature received: 0x...
Calling updateStats on contract...
Transaction hash: 0x...
```

---

## ✅ Keuntungan Fallback Mode

1. **Reliability**: App tetap bisa digunakan meskipun backend down
2. **Development**: Frontend bisa dikembangkan tanpa menunggu backend
3. **Testing**: Mudah test fitur tanpa setup backend
4. **User Experience**: Tidak ada error message yang mengganggu user
5. **Offline Support**: Bisa tracking meskipun tidak ada internet (GPS only)

---

## ⚠️ Catatan Penting

1. **Production**: Sebaiknya gunakan backend mode untuk keamanan
2. **Data Loss**: Data lokal bisa hilang jika clear cache
3. **Security**: Fallback mode tidak aman untuk production
4. **Migration**: Perlu implement migration script untuk data lokal

---

## 🎯 Endpoint yang Perlu Diimplement Backend

### Priority 1 (Core Features)
- ✅ `POST /api/activities/start` - Start GPS tracking
- ✅ `POST /api/activities/update` - Update GPS data
- ✅ `POST /api/activities/end` - End tracking & get stats
- ✅ `POST /api/profile/update-stats` - Update profile stats with signature

### Priority 2 (Social Features)
- ⏳ `POST /api/events/join` - Join event
- ⏳ `POST /api/achievements/claim` - Claim achievement with signature

### Priority 3 (Optional)
- ⏳ `GET /api/activities/history` - Get activity history
- ⏳ `GET /api/leaderboard` - Get leaderboard
- ⏳ `POST /api/activities/migrate` - Migrate local data

---

**Status**: ✅ FALLBACK MODE ACTIVE  
**Mode**: Backend + Local Fallback  
**Ready**: YES

Aplikasi sekarang bisa berjalan dengan atau tanpa backend! 🎉
