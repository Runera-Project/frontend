# XP Not Increasing - Troubleshooting Guide

## Problem
User melakukan lari dan post, tapi XP tidak bertambah.

## Possible Causes

### 1️⃣ **Run Not Verified by Backend**

Backend punya validation logic yang bisa reject run jika:

#### Distance Too Small
```javascript
// Backend validation (kemungkinan)
if (distanceMeters < 100) {  // Minimum 100 meters
  return { status: "REJECTED", reasonCode: "DISTANCE_TOO_SMALL" }
}
```

#### Duration Too Short
```javascript
if (durationSeconds < 60) {  // Minimum 1 minute
  return { status: "REJECTED", reasonCode: "DURATION_TOO_SHORT" }
}
```

#### Invalid Pace
```javascript
const paceMinPerKm = (durationSeconds / 60) / (distanceMeters / 1000);

// Pace terlalu cepat (< 2 min/km = superhuman)
if (paceMinPerKm < 2) {
  return { status: "REJECTED", reasonCode: "PACE_TOO_FAST" }
}

// Pace terlalu lambat (> 20 min/km = walking)
if (paceMinPerKm > 20) {
  return { status: "REJECTED", reasonCode: "PACE_TOO_SLOW" }
}
```

#### No GPS Data
```javascript
if (!gpsData || gpsData.length < 2) {
  return { status: "REJECTED", reasonCode: "INSUFFICIENT_GPS_DATA" }
}
```

---

### 2️⃣ **JWT Token Missing**

User belum authenticate dengan backend:

```typescript
// Check JWT token
const token = localStorage.getItem('runera_token');
if (!token) {
  // ❌ Request akan gagal atau tidak bisa identify user
}
```

**Solution:** User harus sign message saat login untuk dapat JWT token.

---

### 3️⃣ **Backend Response Structure Mismatch**

Frontend mencoba baca XP dari response, tapi structure berbeda:

```typescript
// Frontend expects:
result.onchainSync.stats.xp
// or
result.run.xpEarned

// But backend might return:
result.xpEarned
// or different structure
```

---

## Debugging Steps

### Step 1: Check Console Logs

Setelah post run, check browser console:

```
=== BACKEND RESPONSE ===
Full response: { ... }
Status: VERIFIED or REJECTED
Reason Code: null or error code
```

**If Status = REJECTED:**
- Check `reasonCode` untuk tahu kenapa di-reject
- Fix issue (increase distance, duration, etc)

**If Status = VERIFIED but no XP:**
- Check response structure
- XP mungkin ada di field yang berbeda

---

### Step 2: Check JWT Token

Open browser console:
```javascript
localStorage.getItem('runera_token')
```

**If null:**
- User belum authenticate
- Redirect ke login page
- Sign message untuk dapat JWT

**If exists:**
- Token valid
- Backend bisa identify user

---

### Step 3: Check Backend Logs

Jika punya akses ke backend logs, check:

```
POST /run/submit
Request: { distanceMeters, durationSeconds, ... }
Validation: PASSED or FAILED
Status: VERIFIED or REJECTED
XP Earned: 100
```

---

## Common Issues & Solutions

### Issue 1: Distance = 0 or Too Small

**Problem:**
```typescript
distanceMeters: 0  // ❌ Backend reject
```

**Solution:**
```typescript
// Frontend already has fallback
if (distanceInMeters === 0) {
  distanceInMeters = 1;  // Set to 1 meter for testing
}

// But backend might require minimum 100m
// User harus lari minimal 100 meter
```

---

### Issue 2: No GPS Data

**Problem:**
```typescript
gpsData: []  // ❌ Backend reject
```

**Solution:**
- Ensure GPS tracking is working
- Check browser permissions for geolocation
- GPS data should have at least 2 points

---

### Issue 3: Pace Too Fast/Slow

**Problem:**
```typescript
// 10km in 5 minutes = 0.5 min/km (superhuman!)
distanceMeters: 10000
durationSeconds: 300
// Backend: "PACE_TOO_FAST"
```

**Solution:**
- Use realistic values
- Normal running pace: 5-8 min/km
- Walking pace: 10-15 min/km

---

### Issue 4: JWT Expired

**Problem:**
```
Backend: 401 Unauthorized
Error: "Token expired"
```

**Solution:**
```typescript
// Re-authenticate
localStorage.removeItem('runera_token');
// Redirect to login
router.push('/login');
// Sign message again
```

---

## Testing Checklist

### ✅ Before Submitting Run

1. **Check JWT Token**
   ```javascript
   localStorage.getItem('runera_token') !== null
   ```

2. **Check Distance**
   ```javascript
   distanceMeters >= 100  // Minimum 100m
   ```

3. **Check Duration**
   ```javascript
   durationSeconds >= 60  // Minimum 1 minute
   ```

4. **Check Pace**
   ```javascript
   const paceMinPerKm = (durationSeconds / 60) / (distanceMeters / 1000);
   paceMinPerKm >= 2 && paceMinPerKm <= 20  // Realistic pace
   ```

5. **Check GPS Data**
   ```javascript
   gpsData.length >= 2  // At least 2 GPS points
   ```

---

### ✅ After Submitting Run

1. **Check Console Logs**
   - Look for "=== BACKEND RESPONSE ==="
   - Check status: VERIFIED or REJECTED
   - Check reasonCode if rejected

2. **Check XP in Response**
   - Look for "✅ XP from ..."
   - If "⚠️ No XP found", check response structure

3. **Check Profile Update**
   - Go to profile page
   - Refresh to fetch latest data from smart contract
   - Check if XP/level increased

---

## Backend Validation Rules (Estimated)

Based on backend README and common practices:

| Rule | Minimum | Maximum | Reason |
|------|---------|---------|--------|
| Distance | 100m | 100km | Prevent spam / unrealistic |
| Duration | 60s | 24h | Prevent spam / unrealistic |
| Pace | 2 min/km | 20 min/km | Prevent cheating |
| GPS Points | 2 | 10000 | Need route data |

**Note:** Actual values might be different. Check backend source code for exact validation rules.

---

## Next Steps

1. **Test with realistic values:**
   ```typescript
   distanceMeters: 1000,      // 1km
   durationSeconds: 360,      // 6 minutes
   pace: "6:00 min/km"        // Normal running pace
   gpsData: [...]             // At least 2 GPS points
   ```

2. **Check console logs** after submit

3. **If still no XP:**
   - Share backend response structure
   - Check backend logs
   - Verify backend validation rules

4. **Contact backend team** with:
   - Run ID
   - Backend response
   - Console logs
   - Expected vs actual behavior
