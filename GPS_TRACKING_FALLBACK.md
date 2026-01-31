# 🗺️ GPS Tracking dengan Fallback Mode

## Overview

GPS tracking sekarang memiliki **fallback mode** yang memungkinkan tracking tetap berjalan meskipun backend tidak tersedia atau endpoint belum diimplementasikan.

---

## 🔄 Cara Kerja

### Mode 1: Backend Tracking (Ideal)
```
User klik "Start"
  ↓
POST /api/activities/start → Get activityId
  ↓
GPS tracking starts
  ↓
Every 10 seconds: POST /api/activities/update
  ↓
User klik "Stop"
  ↓
POST /api/activities/end → Get stats & XP
  ↓
Navigate to Validate page
```

### Mode 2: Local Tracking (Fallback)
```
User klik "Start"
  ↓
Backend not available (404/500)
  ↓
Generate local activityId: "local-{timestamp}-{address}"
  ↓
GPS tracking starts (local only)
  ↓
User klik "Stop"
  ↓
Calculate stats locally (distance, duration, speed)
  ↓
Calculate XP: 1 XP per 100 meters
  ↓
Navigate to Validate page
```

---

## 🎯 Deteksi Mode

Activity ID menentukan mode tracking:

- **Backend mode**: `activityId` dari backend (contoh: `"act_123456"`)
- **Local mode**: `activityId` dimulai dengan `"local-"` (contoh: `"local-1738252800000-0x439069"`)

---

## 📊 Perhitungan Stats Lokal

### Distance (Haversine Formula)
```typescript
// Calculate distance between two GPS points
const R = 6371000; // Earth radius in meters
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;
const a = 
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distance = R * c; // in meters
```

### Duration
```typescript
const duration = (lastTimestamp - firstTimestamp) / 1000; // in seconds
```

### Average Speed
```typescript
const avgSpeed = totalDistance / duration; // in m/s
```

### XP Earned
```typescript
const xpEarned = Math.round(totalDistance / 100); // 1 XP per 100 meters
```

---

## ⚠️ Perbedaan Mode

| Feature | Backend Mode | Local Mode |
|---------|-------------|------------|
| Activity ID | Dari backend | Generated locally |
| GPS Data Storage | Sent to backend | Local only |
| Stats Calculation | Backend | Frontend |
| XP Calculation | Backend (verified) | Frontend (estimated) |
| Anti-cheat | ✅ Yes | ❌ No |
| Requires Backend | ✅ Yes | ❌ No |

---

## 🔧 Error Handling

### Backend Unavailable (404/500)
```typescript
try {
  const result = await startActivity({ ... });
  // Use backend mode
} catch (error) {
  console.warn('Backend not available, using local tracking');
  // Fallback to local mode
  const localActivityId = `local-${Date.now()}-${address.slice(0, 8)}`;
}
```

### GPS Permission Denied
```typescript
if (!navigator.geolocation) {
  throw new Error('Geolocation not supported');
}

navigator.geolocation.watchPosition(
  (position) => { /* success */ },
  (error) => {
    console.error('GPS error:', error);
    setError('Please enable location access');
  },
  { enableHighAccuracy: true }
);
```

---

## 🧪 Testing

### Test Backend Mode
1. Pastikan backend online
2. Start tracking
3. Check console: "Backend activity started: act_123456"
4. GPS data akan dikirim setiap 10 detik
5. Stop tracking
6. Check console: "Backend activity ended"

### Test Local Mode
1. Matikan backend atau gunakan backend yang belum implement endpoint
2. Start tracking
3. Check console: "Backend not available, using local tracking"
4. Check console: "Local activity started: local-1738252800000-0x439069"
5. GPS data hanya disimpan lokal
6. Stop tracking
7. Check console: "Local activity ended"

---

## 📝 Console Logs

### Backend Mode
```
Starting activity with backend...
Backend activity started: act_123456
GPS point recorded: { latitude: ..., longitude: ..., timestamp: ... }
GPS data sent to backend
Ending activity with backend...
Backend activity ended: { stats: {...}, xpEarned: 100 }
```

### Local Mode
```
Starting activity with backend...
Backend not available, using local tracking: HTTP 404
Local activity started: local-1738252800000-0x439069
GPS point recorded: { latitude: ..., longitude: ..., timestamp: ... }
Ending local activity...
Local activity ended: { stats: {...}, xpEarned: 50 }
```

---

## 🚀 Implementasi Backend

Untuk mengaktifkan backend mode, backend perlu implement 3 endpoint:

### 1. POST /api/activities/start
```typescript
Request:
{
  userAddress: string;
  activityType: 'run' | 'walk' | 'cycle';
}

Response:
{
  success: boolean;
  activityId: string;
  startTime: number;
}
```

### 2. POST /api/activities/update
```typescript
Request:
{
  activityId: string;
  gpsData: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
  }>;
}

Response:
{
  success: boolean;
  activityId: string;
  pointsRecorded: number;
}
```

### 3. POST /api/activities/end
```typescript
Request:
{
  activityId: string;
  userAddress: string;
}

Response:
{
  success: boolean;
  activityId: string;
  stats: {
    distance: number; // in meters
    duration: number; // in seconds
    avgSpeed: number; // in m/s
  };
  xpEarned: number;
}
```

---

## ✅ Keuntungan Fallback Mode

1. **Reliability**: App tetap bisa digunakan meskipun backend down
2. **Development**: Frontend bisa dikembangkan tanpa menunggu backend
3. **Testing**: Mudah test GPS tracking tanpa setup backend
4. **User Experience**: Tidak ada error message yang mengganggu user

---

## ⚠️ Catatan Penting

1. **Local mode tidak aman**: XP bisa di-manipulasi karena dihitung di frontend
2. **Production**: Sebaiknya gunakan backend mode untuk anti-cheat
3. **Validation**: Backend harus validate GPS data untuk mencegah cheating
4. **Fallback**: Local mode hanya untuk development/testing atau emergency fallback

---

**Status**: ✅ IMPLEMENTED  
**Mode**: Backend + Local Fallback  
**Ready**: YES

GPS tracking sekarang bisa berjalan dengan atau tanpa backend!
