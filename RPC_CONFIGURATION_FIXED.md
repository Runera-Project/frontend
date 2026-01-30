# RPC Configuration Fixed

## Date: January 31, 2026

## Problem
The application was experiencing transaction failures, and the user wanted to revert to the previous RPC configuration (public Base Sepolia endpoint instead of Alchemy).

## Root Cause
The `app/providers.tsx` was NOT using the `NEXT_PUBLIC_RPC_URL` environment variable. It was using `http()` without any URL parameter, which means wagmi was using its default RPC endpoint instead of the one specified in `.env.local`.

## Changes Made

### 1. Fixed `app/providers.tsx`
**Before:**
```typescript
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),  // ❌ Not using env variable!
  },
});
```

**After:**
```typescript
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org'),  // ✅ Now uses env variable
  },
});
```

### 2. Updated `.env.local`
- Removed `PRIVATE_KEY` (security risk - should never be in frontend!)
- Confirmed `NEXT_PUBLIC_RPC_URL=https://sepolia.base.org` (public endpoint)
- Alchemy RPC remains commented out as backup option

### 3. Updated `.env`
- Removed `PRIVATE_KEY` (security risk)
- Changed RPC from Alchemy to public endpoint: `NEXT_PUBLIC_RPC_URL=https://sepolia.base.org`

## Current Configuration

### RPC Endpoint
```
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

### Chain
- Network: Base Sepolia Testnet
- Chain ID: 84532

### Contract Addresses
- AccessControl: `0x669da3E9A1e9073EDBEfAf227E6e793476176bFf`
- ProfileNFT: `0x725d729107C4bC61f3665CE1C813CbcEC7214343`
- AchievementNFT: `0x6941280D4aaFe1FC8Fe07506B50Aff541a1B8bD9`
- CosmeticNFT: `0x18Aaa730d09C77C92bCf793dE8FcDEFE48c03A4f`
- Marketplace: `0xc91263B231ed03d1F0E6B48818A7D8D6ef7FC2aB`
- EventRegistry: `0xbb426df3f52701CcC82d0C771D6B3Ef5210db471`

## Next Steps

### 1. Restart Dev Server
```bash
npm run dev
```

### 2. Clear Browser Cache
Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh

### 3. Test Transaction
1. Go to `/record` page
2. Record a run (or use dummy data)
3. Submit the run
4. Check if transaction succeeds

### 4. Verify Network
- Ensure MetaMask is on Base Sepolia Testnet
- Check that the RPC URL in MetaMask matches: `https://sepolia.base.org`

## Important Notes

### Security
- ⚠️ **NEVER** put `PRIVATE_KEY` in frontend `.env` files!
- Private keys should only be in backend environment variables
- Frontend only needs public configuration (contract addresses, RPC URLs, etc.)

### RPC Endpoint Options
If the public endpoint (`https://sepolia.base.org`) is unstable, you can switch to Alchemy:

1. Get free API key from: https://dashboard.alchemy.com/
2. Uncomment in `.env.local`:
   ```
   NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   ```
3. Restart dev server

### Why This Fix Matters
Previously, even though you set `NEXT_PUBLIC_RPC_URL` in `.env.local`, the application wasn't using it because `app/providers.tsx` wasn't reading the environment variable. Now it properly uses whatever RPC URL you configure.

## Testing Checklist
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] MetaMask on Base Sepolia
- [ ] Transaction submission works
- [ ] No RPC errors in console
- [ ] Transaction appears on BaseScan

## Troubleshooting

### If transactions still fail:
1. Check MetaMask network (should be Base Sepolia)
2. Check console for RPC errors
3. Verify wallet has Base Sepolia ETH for gas
4. Try switching to Alchemy RPC if public endpoint is down
5. Check BaseScan for transaction details

### If RPC errors persist:
The public Base Sepolia endpoint can be unstable. Consider using Alchemy RPC for better reliability.
