# 🐛 Profile Not Detected - Troubleshooting

## Problem
User successfully minted profile NFT (transaction confirmed), but app still shows "Create Your Profile" modal after refresh.

## Root Cause
The `hasProfile()` function is returning `false` even though profile exists. Possible reasons:

### 1. **ABI Mismatch** (Most Likely)
The ABI file we're using is a **placeholder**, not the actual contract ABI from Foundry.

**Evidence**:
- ABI was manually created with basic function signatures
- May not match the actual deployed contract
- Function names or parameters might be different

**Solution**: Get the real ABI from Foundry build artifacts

### 2. **Wrong Contract Address**
Contract address in `.env.local` might be wrong or pointing to different deployment.

**Check**:
```bash
# Current address in .env.local:
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321
```

**Verify**: Check if this is the correct deployed contract address

### 3. **Different Wallet Address**
User might have minted with one wallet but logged in with different wallet.

**Check**:
- Privy embedded wallet address
- External wallet address (MetaMask, etc.)
- Which wallet was used for minting?

### 4. **Network Issue**
App might be calling contract on wrong network.

**Check**:
- Is wagmi configured for Base network?
- Is RPC endpoint working?

---

## Debug Steps

### Step 1: Use Debug Panel
I've added a debug button to the app:

1. **Login to app**
2. **Click "🐛 Debug" button** (bottom right)
3. **Check the information**:
   - Wallet address
   - Contract address
   - Has Profile status
   - Profile data (if exists)

### Step 2: Manual Check on BaseScan

1. **Go to contract**: https://basescan.org/address/0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321#readContract

2. **Find "hasProfile" function**

3. **Enter your wallet address** (copy from debug panel)

4. **Click "Query"**

5. **Check result**:
   - `true` = You have profile (frontend bug)
   - `false` = You don't have profile (transaction might have failed)

### Step 3: Check Transaction History

1. **Go to your address on BaseScan**: https://basescan.org/address/YOUR_ADDRESS

2. **Look for "Register" transaction** to Profile NFT contract

3. **Check transaction status**:
   - Success ✅ = Profile should exist
   - Failed ❌ = Profile not created

4. **Check "Logs" tab** in transaction:
   - Look for `ProfileRegistered` event
   - Should have your address

---

## Solutions

### Solution 1: Get Real ABI from Smart Contract Team

**What you need**:
```
1. Go to smart contract repo
2. Find: out/RuneraProfileDynamicNFT.sol/RuneraProfileDynamicNFT.json
3. Copy the "abi" array
4. Replace content in: ABI/RuneraProfileDynamicNFTABI.json
```

**Example**:
```bash
# In smart contract repo
cd out/RuneraProfileDynamicNFT.sol/
cat RuneraProfileDynamicNFT.json | jq '.abi' > ~/frontend/ABI/RuneraProfileDynamicNFTABI.json
```

### Solution 2: Verify Contract Address

**Check deployment logs** from smart contract team:
```
Profile NFT deployed to: 0x...
```

**Update `.env.local`** if address is wrong:
```bash
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0xCORRECT_ADDRESS_HERE
```

### Solution 3: Check Wallet Address

**In Debug Panel**:
1. Copy your wallet address
2. Check transaction on BaseScan
3. Verify "From" address matches

**If different**:
- You might have multiple wallets
- Login with the wallet that minted the profile

### Solution 4: Force Refetch

**Add manual refetch button**:
```typescript
// In ProfileRegistration component
<button onClick={() => {
  refetch();
  window.location.reload();
}}>
  Force Refresh
</button>
```

---

## Temporary Workaround

While waiting for real ABI, you can manually hide the modal:

### Option A: Check Transaction Directly

```typescript
// In useProfile hook, add alternative check:
const { data: tokenBalance } = useReadContract({
  address: CONTRACTS.ProfileNFT,
  abi: [
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [{"name": "owner", "type": "address"}],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view"
    }
  ],
  functionName: 'balanceOf',
  args: address ? [address] : undefined,
});

// If balanceOf > 0, user has profile NFT
const hasProfileAlt = tokenBalance && tokenBalance > 0n;
```

### Option B: Use Events

```typescript
// Check ProfileRegistered event
const { data: events } = useContractEvent({
  address: CONTRACTS.ProfileNFT,
  abi: ABIS.ProfileNFT,
  eventName: 'ProfileRegistered',
  args: {
    user: address,
  },
});

// If event exists, user registered
const hasProfileFromEvent = events && events.length > 0;
```

---

## Testing Checklist

After getting real ABI:

- [ ] Replace ABI file with real one from Foundry
- [ ] Restart dev server
- [ ] Clear browser cache
- [ ] Login again
- [ ] Check debug panel
- [ ] Verify hasProfile returns true
- [ ] Modal should not appear
- [ ] Profile page should show data

---

## What to Report

Please provide:

### 1. Debug Panel Info
- Screenshot of debug panel
- Wallet address
- Has Profile status

### 2. BaseScan Check
- Screenshot of hasProfile query result
- Screenshot of your transaction
- Transaction hash

### 3. Console Logs
- Open browser console (F12)
- Look for "=== Profile Check ===" logs
- Screenshot the logs

### 4. Contract Info
- Confirm contract address is correct
- Confirm you're on Base network
- Confirm ABI is from Foundry (not placeholder)

---

## Next Steps

1. **Use Debug Panel** - Click 🐛 button and check status
2. **Manual Check** - Verify hasProfile on BaseScan
3. **Get Real ABI** - Replace placeholder with actual ABI
4. **Report Results** - Send debug info

---

**Priority**: 🔴 CRITICAL  
**Status**: Investigating  
**Blocker**: Need real ABI from smart contract team
