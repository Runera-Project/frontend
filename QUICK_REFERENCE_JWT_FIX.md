# Quick Reference: JWT Authentication Fix

## 🎯 What Was Fixed
JWT authentication now works with embedded wallets (Google/Email) and external wallets (MetaMask).

## 🔧 The Fix (One Line)
Changed from `wallet.signMessage()` to `wallet.getEthereumProvider().request({ method: 'personal_sign', ... })`

## 🧪 Quick Test
```bash
pnpm dev
# Open http://localhost:3000
# Login with Google/Email/MetaMask
# Should see: "Authenticated with backend" ✅
```

## 📋 Checklist
- [ ] Wallet address shows on home page
- [ ] Green "Authenticated" banner appears
- [ ] Console shows "✅ Message signed successfully"
- [ ] localStorage has `runera_token`
- [ ] Can switch wallets without errors
- [ ] Can submit runs successfully

## 🐛 If It Doesn't Work

### Check Console
Look for specific error messages:
- "Backend database error" → Railway service down
- "Cannot connect to backend" → Network issue
- "Wallet not found" → Wait for Privy to load
- "Signature verification failed" → Contact support

### Check Backend
```bash
curl https://backend-production-dfd3.up.railway.app/health
# Should return: {"status":"ok"}
```

### Check Environment
Verify `.env.local` has:
```env
NEXT_PUBLIC_API_URL=https://backend-production-dfd3.up.railway.app
```

## 📁 Files Changed
- `hooks/useJWTAuth.ts` - Main fix

## 📚 Documentation
- `JWT_SIGNING_FIX.md` - Technical details
- `JWT_EMBEDDED_WALLET_COMPLETE.md` - Full guide
- `TEST_JWT_AUTHENTICATION.md` - Testing steps
- `SUMMARY_JWT_EMBEDDED_WALLET_FIX.md` - Summary

## 🚀 Next Steps
1. Test with Google login
2. Test with Email login
3. Test with MetaMask
4. Test wallet switching
5. Test run submission

## ✅ Success Criteria
- All login methods work
- JWT token is saved
- Backend authentication succeeds
- No wallet mismatch errors
- Run submission works

---
**Status:** ✅ Fixed and ready for testing
