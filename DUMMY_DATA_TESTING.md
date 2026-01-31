# Dummy Data Testing - XP Validation

## Overview
Saya sudah tambahkan **Test Mode** di validate page untuk testing dengan dummy data yang guaranteed pass backend validation.

## Changes Made

### 1. Toggle Test Mode
Di validate page sekarang ada toggle switch untuk enable/disable dummy data:

```typescript
const [useDummyData, setUseDummyData] = useState(false);
```

### 2. Dummy Data Specification

Ketika Test Mode enabled, frontend akan kirim data ini:

```typescript
{
  distanceMeters: 5000,        // 5km (✅ > 100m minimum)
  durationSeconds: 1800,       // 30 minutes (✅ > 60s minimum)
  pace: "6:00 min/km",         // ✅ Realistic pace (2-20 min/km)
  gpsData: [                   // ✅ 5 GPS points (> 2 minimum)
    { lat: -6.2088, lng: 106.8456, timestamp, accuracy: 10 },
    { lat: -6.2100, lng: 106.8470, timestamp, accuracy: 10 },
    { lat: -6.2115, lng: 106.8485, timestamp, accuracy: 10 },
    { lat: -6.2130, lng: 106.8500, timestamp, accuracy: 10 },
    { lat: -6.2145, lng: 106.8515, timestamp, accuracy: 10 }
  ],
  startTime: Date.now() - 1800000,  // 30 minutes ago
  endTime: Date.now(),
  deviceHash: "..."
}
```

### 3. Validation Checks

Dummy data memenuhi semua validation rules:

| Rule | Requirement | Dummy Data | Status |
|------|-------------|------------|--------|
| Distance | ≥ 100m | 5000m (5km) | ✅ |
| Duration | ≥ 60s | 1800s (30min) | ✅ |
| Pace | 2-20 min/km | 6:00 min/km | ✅ |
| GPS Points | ≥ 2 | 5 points | ✅ |

## How to Test

### Step 1: Go to Validate Page
1. Click "Record" di bottom navigation
2. Click "Start" (atau langsung ke validate page)
3. Click "Stop"
4. Akan redirect ke validate page

### Step 2: Enable Test Mode
1. Di validate page, lihat yellow box "🧪 Test Mode"
2. Toggle switch ke ON (akan jadi kuning)
3. Text akan berubah: "✅ Using dummy data (5km, 30min, 6:00 pace, GPS data)"

### Step 3: Submit
1. Click "Test Submit" button (bukan "Post")
2. Check console logs untuk response
3. Lihat apakah:
   - Status: VERIFIED ✅
   - XP earned: 100 (atau sesuai backend config)
   - Run ID: cuid

### Step 4: Verify XP
1. Go to Profile page
2. Refresh untuk fetch latest data
3. Check apakah XP/Level bertambah

## Console Logs to Check

### ✅ Success Case
```
🧪 Using DUMMY DATA for testing
✅ Dummy data: {
  distance: '5000m (5km)',
  duration: '1800s (30min)',
  pace: '6:00 min/km',
  gpsPoints: 5
}

Submitting run to backend: { ... }

=== BACKEND RESPONSE ===
Full response: {
  "runId": "clxxx...",
  "status": "VERIFIED",
  "reasonCode": null,
  "onchainSync": {
    "signature": "0x...",
    "deadline": 1234567890,
    "stats": {
      "xp": 100,
      "level": 1,
      ...
    }
  }
}
Status: VERIFIED
Reason Code: null
Run ID: clxxx...
✅ XP from onchainSync.stats.xp: 100
```

### ❌ Failure Case (Still Rejected)
```
🧪 Using DUMMY DATA for testing
✅ Dummy data: { ... }

=== BACKEND RESPONSE ===
Status: REJECTED
Reason Code: SOME_ERROR
⚠️ Run was not verified!
```

**If this happens:**
- Backend validation rules berbeda dari yang kita expect
- Perlu check backend source code
- Atau ada issue lain (JWT, database, etc)

## Comparison: Real vs Dummy Data

### Real Data (Test Mode OFF)
```typescript
// Data dari GPS tracking
distanceMeters: 0-1000m      // Mungkin terlalu kecil
durationSeconds: 0-60s       // Mungkin terlalu pendek
gpsData: []                  // Mungkin kosong
pace: varies                 // Mungkin tidak realistic
```

### Dummy Data (Test Mode ON)
```typescript
// Data yang guaranteed pass
distanceMeters: 5000m        // ✅ Well above minimum
durationSeconds: 1800s       // ✅ Realistic duration
gpsData: [5 points]          // ✅ Sufficient GPS data
pace: 6:00 min/km           // ✅ Realistic pace
```

## Expected Results

### If Dummy Data Works:
✅ Backend validation rules are correct  
✅ JWT authentication is working  
✅ Backend can process requests  
✅ XP calculation is working  
❌ **Problem is with real GPS tracking data**

**Next steps:**
- Fix GPS tracking to collect proper data
- Ensure minimum distance/duration
- Validate GPS coordinates

### If Dummy Data Still Fails:
❌ Backend validation rules are different  
❌ JWT authentication issue  
❌ Backend error (database, smart contract, etc)  
❌ **Problem is with backend, not frontend**

**Next steps:**
- Check backend logs
- Verify backend validation rules
- Check JWT token validity
- Contact backend team

## UI Changes

### Test Mode Box (Yellow)
```
┌─────────────────────────────────────┐
│ 🧪 Test Mode              [Toggle]  │
│ ✅ Using dummy data (5km, 30min...) │
└─────────────────────────────────────┘
```

### Buttons
- **Test Mode OFF:** "Post" button (blue)
- **Test Mode ON:** "Test Submit" button (blue)

## Testing Checklist

Before testing:
- [ ] JWT token exists (`localStorage.getItem('runera_token')`)
- [ ] Wallet connected
- [ ] Backend is running

During testing:
- [ ] Enable Test Mode toggle
- [ ] Click "Test Submit"
- [ ] Check console logs
- [ ] Note status (VERIFIED/REJECTED)
- [ ] Note XP earned (if any)

After testing:
- [ ] Go to Profile page
- [ ] Refresh to fetch latest data
- [ ] Check if XP/Level increased
- [ ] Share results (console logs + profile data)

## Troubleshooting

### Toggle Not Working
- Refresh page
- Check browser console for errors

### Still Getting REJECTED
- Check console logs for reasonCode
- Backend validation rules might be stricter
- Share backend response with team

### No XP in Response
- Check response structure in console
- XP might be in different field
- Backend might not return XP directly

### Profile Not Updating
- Wait a few seconds (blockchain delay)
- Refresh profile page
- Check if backend called smart contract
- Verify transaction on BaseScan

## Next Steps

1. **Test with dummy data** → See if XP increases
2. **If works:** Fix real GPS tracking
3. **If fails:** Debug backend validation
4. **Share results** with team for further investigation
