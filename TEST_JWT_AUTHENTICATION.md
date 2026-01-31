# Testing JWT Authentication - Quick Guide

## What Was Fixed

✅ JWT authentication now works with **embedded wallets** (Google/Email login)
✅ JWT authentication now works with **external wallets** (MetaMask)
✅ Wallet switching no longer causes authentication errors
✅ Better error messages for debugging

## How to Test

### 1. Test with Google Login (Embedded Wallet)

```bash
# Start the dev server
pnpm dev
```

1. Open browser: `http://localhost:3000`
2. Click **"Login with Google"**
3. Complete Google authentication
4. You should see:
   - ✅ Wallet address displayed on home page
   - ✅ "Authenticating..." banner (briefly)
   - ✅ "Authenticated with backend" green banner
5. Open browser console (F12) and check for:
   ```
   ✅ Message signed successfully
   ✅ JWT token received and saved
   ```
6. Check localStorage:
   - Open DevTools → Application → Local Storage
   - Look for `runera_token` key
   - Should contain a JWT token

### 2. Test with Email Login (Embedded Wallet)

1. Click **"Login with Email"**
2. Enter your email
3. Complete email verification
4. Same checks as Google login above

### 3. Test with MetaMask (External Wallet)

1. Click **"Connect Wallet"**
2. Select MetaMask
3. Approve connection
4. **Approve signature request** in MetaMask popup
5. Same checks as above

### 4. Test Wallet Switching

**This was the main bug - now fixed!**

1. Login with Wallet 1 (any method)
2. Wait for "Authenticated with backend" banner
3. Click **Logout** (top right)
4. Login with Wallet 2 (different wallet)
5. Should authenticate successfully (no wallet mismatch error)

### 5. Test Run Submission

1. Login (any method)
2. Go to **Record** page
3. Start a run
4. Complete the run
5. Submit the run
6. Should succeed without errors

## Expected Console Output

### Successful Authentication
```
🔐 Starting JWT authentication...
📍 Wallet address: 0x1234567890abcdef...
📡 Requesting nonce from backend...
✅ Nonce received: abc123def456...
📝 Message to sign: RUNERA login
Nonce: abc123def456...
✍️ Requesting signature from wallet...
Available wallets: 1
✅ Found wallet: { address: '0x1234...', type: 'privy' }
✅ Got Ethereum provider
📝 Message to sign: RUNERA login
Nonce: abc123def456...
✅ Message signed successfully
✅ Signature: 0x5678...
🔗 Connecting to backend...
✅ JWT token received and saved for wallet: 0x1234...
```

### If Backend is Down
```
❌ Backend authentication failed: Error: Failed to create nonce
💾 Database error - Railway service might be down
📝 User-friendly error: Backend database error. Please try again later.
```

You'll see a yellow warning banner:
> ⚠️ **Authentication Warning**
> Backend database error. Please try again later.
> You can still use the app, but some features may be limited.

## Common Issues

### Issue: No signature popup appears
**Cause:** Wallet not loaded yet
**Solution:** Wait a few seconds and refresh the page

### Issue: "Wallet not found for signing"
**Cause:** Privy hasn't loaded wallets yet
**Solution:** Check console - should show `Available wallets: 0`. Wait and refresh.

### Issue: "Backend database error"
**Cause:** Railway database is sleeping or down
**Solution:** 
1. Check Railway dashboard
2. Wake up the service
3. Refresh the page

### Issue: "Cannot connect to backend"
**Cause:** Network error or wrong backend URL
**Solution:**
1. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
2. Should be: `https://backend-production-dfd3.up.railway.app`
3. Check internet connection

### Issue: "Signature verification failed"
**Cause:** Message format mismatch
**Solution:** This shouldn't happen with the fix. If it does:
1. Check backend logs
2. Verify message format: `RUNERA login\nNonce: {nonce}`

## Verification Checklist

- [ ] Google login creates embedded wallet
- [ ] Email login creates embedded wallet
- [ ] MetaMask login works
- [ ] Wallet address is displayed
- [ ] JWT authentication succeeds
- [ ] JWT token is saved to localStorage
- [ ] Can switch between wallets without errors
- [ ] Can submit runs successfully
- [ ] Error messages are user-friendly

## Backend Status

Check if backend is running:
```bash
curl https://backend-production-dfd3.up.railway.app/health
```

Should return:
```json
{"status":"ok"}
```

## Next Steps After Testing

If all tests pass:
1. ✅ JWT authentication is working
2. ✅ Embedded wallets are working
3. ✅ Ready to test other features (run submission, achievements, etc.)

If tests fail:
1. Check console logs for specific errors
2. Check backend Railway logs
3. Verify environment variables
4. Check network connectivity

## Files to Check

- `hooks/useJWTAuth.ts` - JWT authentication logic
- `app/page.tsx` - Home page with auth status
- `lib/api.ts` - API client with JWT token
- `.env.local` - Environment variables

## Environment Variables

Verify these are set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://backend-production-dfd3.up.railway.app
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_PRIVY_APP_ID=cmky60ltc00vpl80cuca2k36w
```
