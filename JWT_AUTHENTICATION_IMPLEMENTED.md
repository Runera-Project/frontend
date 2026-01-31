# JWT Authentication Implemented

## Overview
Frontend sekarang menggunakan JWT authentication untuk berkomunikasi dengan backend. Backend akan otomatis extract wallet address dari JWT token, jadi frontend tidak perlu kirim `walletAddress` lagi.

## Changes Made

### 1. `lib/api.ts`
**Added:**
- `getAuthToken()` - Get JWT token from localStorage
- `requestNonce()` - Request nonce from backend (POST /auth/nonce)
- `connectWallet()` - Connect wallet and get JWT token (POST /auth/connect)
- Auto-inject JWT token in `Authorization` header for all API calls

**Updated:**
- `fetchAPI()` now includes `Authorization: Bearer ${token}` header
- `RunSubmitRequest.walletAddress` is now optional (backend extracts from JWT)

### 2. `app/login/page.tsx`
**Added JWT Authentication Flow:**
1. User clicks "Sign In" → Privy login
2. When wallet connected → Auto-request nonce from backend
3. User signs message in wallet
4. Frontend sends signature to backend → Get JWT token
5. Token saved to `localStorage.getItem('runera_token')`

**Features:**
- Auto-authenticate when wallet connects
- Show "Authenticating..." state during sign process
- Graceful fallback if backend unavailable

### 3. `app/record/validate/page.tsx`
**Updated:**
- Removed `walletAddress` from `runData` payload
- Backend will extract wallet address from JWT token automatically

## Authentication Flow

### Step 1: Request Nonce
```typescript
POST /auth/nonce
Body: { "walletAddress": "0x..." }
Response: { "nonce": "abc123", "message": "RUNERA login\nNonce: abc123" }
```

### Step 2: Sign Message
User signs message in wallet (Metamask/Privy):
```
Message: "RUNERA login\nNonce: abc123"
```

### Step 3: Connect & Get JWT
```typescript
POST /auth/connect
Body: {
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "RUNERA login\nNonce: abc123",
  "nonce": "abc123"
}
Response: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### Step 4: Save Token
```typescript
localStorage.setItem('runera_token', token);
```

## Using JWT in API Calls

### Before (Manual walletAddress)
```typescript
await submitRun({
  walletAddress: "0x...",  // ❌ Manual
  distanceMeters: 1000,
  durationSeconds: 600,
  ...
});
```

### After (Auto from JWT)
```typescript
await submitRun({
  // ✅ walletAddress extracted from JWT by backend
  distanceMeters: 1000,
  durationSeconds: 600,
  ...
});
```

## Token Storage
- **Location**: `localStorage.getItem('runera_token')`
- **Lifetime**: Set by backend (typically 30 days)
- **Auto-inject**: All API calls automatically include `Authorization: Bearer ${token}` header

## Error Handling
- If JWT expired → Backend returns 401 → Frontend should re-authenticate
- If backend unavailable → Frontend falls back to localStorage (no JWT needed)
- If user declines signature → Authentication skipped, app still works with localStorage

## Security
- JWT token contains wallet address (verified by backend)
- Backend validates signature before issuing JWT
- Token stored in localStorage (client-side only)
- All API calls require valid JWT token

## Testing
1. Login → Check console for "✅ JWT token saved to localStorage"
2. Submit run → Check Network tab for `Authorization: Bearer ...` header
3. Backend should extract wallet address from JWT automatically
4. No need to send `walletAddress` in request body anymore

## Status
✅ JWT authentication flow implemented
✅ Auto-authenticate on wallet connect
✅ Token auto-injected in all API calls
✅ Backend extracts wallet address from JWT
✅ Graceful fallback if backend unavailable
