# 🐛 Transaction Failed - Debugging Guide

## User Report
**Transaction Hash**: `0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70`  
**Status**: ❌ FAILED  
**Issue**: User tried to mint profile NFT but transaction failed on-chain

---

## Common Reasons for Transaction Failure

### 1. **Insufficient Gas** ⛽
**Symptom**: Transaction runs out of gas  
**Solution**: 
- Check if wallet has enough ETH for gas
- Base network uses ETH for gas fees
- Typical gas cost: ~0.0001 - 0.001 ETH

**Check**:
```bash
# User needs at least 0.001 ETH on Base network
```

### 2. **Contract Revert - Already Registered** 🔄
**Symptom**: Contract reverts with "Already registered" or similar  
**Reason**: User already has a profile NFT  
**Solution**: 
- Check `hasProfile(address)` before calling `register()`
- Frontend should hide modal if user already has profile

**Fix**: Update `useProfile` hook to properly check `hasProfile`

### 3. **Wrong Network** 🌐
**Symptom**: Transaction sent to wrong network  
**Reason**: Wallet connected to Ethereum mainnet instead of Base  
**Solution**:
- Ensure wallet is on Base network (Chain ID: 8453)
- Add network switch prompt

### 4. **Contract Paused** ⏸️
**Symptom**: Contract reverts with "Paused" error  
**Reason**: Smart contract has pause functionality and is currently paused  
**Solution**: 
- Contact smart contract team
- Wait for contract to be unpaused

### 5. **Access Control** 🔒
**Symptom**: "Unauthorized" or "Access denied" error  
**Reason**: Contract has access control and user doesn't have permission  
**Solution**:
- Check if contract requires whitelist
- Verify contract deployment is correct

### 6. **Invalid ABI** 📋
**Symptom**: Function signature mismatch  
**Reason**: ABI doesn't match deployed contract  
**Solution**:
- Get actual ABI from Foundry build artifacts
- Replace placeholder ABI with real one

---

## How to Debug

### Step 1: Check Transaction on BaseScan
```
1. Go to: https://basescan.org/tx/0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70
2. Look for "Error Message" or "Revert Reason"
3. Check "Input Data" to verify function call
4. Check "Gas Used" vs "Gas Limit"
```

### Step 2: Check User's Wallet
```
1. Verify wallet address
2. Check ETH balance on Base network
3. Check if user already has profile NFT
```

### Step 3: Test Contract Directly
```typescript
// In browser console after connecting wallet:

// 1. Check if user has profile
const hasProfile = await profileContract.read.hasProfile([userAddress]);
console.log('Has profile:', hasProfile);

// 2. If false, try to register
const tx = await profileContract.write.register();
console.log('Transaction:', tx);
```

### Step 4: Check Contract State
```typescript
// Check if contract is paused (if it has pause functionality)
// Check if user is whitelisted (if contract has whitelist)
// Check contract owner/admin
```

---

## Quick Fixes

### Fix 1: Add Network Check
Update `ProfileRegistration.tsx` to check network:

```typescript
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export function ProfileRegistration() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const isWrongNetwork = chainId !== base.id;
  
  if (isWrongNetwork) {
    return (
      <div>
        <p>Wrong network detected</p>
        <button onClick={() => switchChain({ chainId: base.id })}>
          Switch to Base
        </button>
      </div>
    );
  }
  
  // ... rest of component
}
```

### Fix 2: Better Error Handling
Already implemented in latest update:
- ✅ Shows detailed error message
- ✅ Technical details in collapsible section
- ✅ Link to contract on BaseScan

### Fix 3: Check hasProfile Before Showing Modal
Already implemented:
```typescript
if (!address || hasProfile) return null;
```

### Fix 4: Add Gas Estimation
```typescript
const registerProfile = async () => {
  try {
    // Estimate gas first
    const gasEstimate = await publicClient.estimateContractGas({
      address: CONTRACTS.ProfileNFT,
      abi: ABIS.ProfileNFT,
      functionName: 'register',
      account: address,
    });
    
    console.log('Estimated gas:', gasEstimate);
    
    // Then execute
    register({
      address: CONTRACTS.ProfileNFT,
      abi: ABIS.ProfileNFT,
      functionName: 'register',
      gas: gasEstimate * 120n / 100n, // Add 20% buffer
    });
  } catch (error) {
    console.error('Gas estimation failed:', error);
  }
};
```

---

## Action Items

### Immediate:
1. ✅ **Check transaction on BaseScan** - Look for revert reason
2. ⏳ **Verify user's wallet** - Check ETH balance and network
3. ⏳ **Test hasProfile()** - Verify if user already has profile
4. ⏳ **Check contract state** - Is it paused? Any access control?

### Short-term:
1. ⏳ **Add network check** - Prompt user to switch to Base if wrong network
2. ⏳ **Add gas estimation** - Show estimated gas cost before transaction
3. ⏳ **Better error messages** - Parse revert reasons and show user-friendly messages
4. ⏳ **Add retry mechanism** - Allow user to retry with higher gas

### Long-term:
1. ⏳ **Get real ABI** - Replace placeholder with actual ABI from Foundry
2. ⏳ **Add transaction monitoring** - Show transaction status in real-time
3. ⏳ **Add error analytics** - Track common errors and fix them
4. ⏳ **Add support chat** - Help users debug issues

---

## Testing Checklist

### Before Minting:
- [ ] Wallet connected to Base network (Chain ID: 8453)
- [ ] Wallet has at least 0.001 ETH for gas
- [ ] User doesn't already have profile NFT
- [ ] Contract is not paused
- [ ] Contract address is correct

### During Minting:
- [ ] Transaction sent successfully
- [ ] Gas estimation succeeds
- [ ] User approves transaction in wallet
- [ ] Transaction is pending (not failed immediately)

### After Minting:
- [ ] Transaction confirmed on-chain
- [ ] `hasProfile()` returns true
- [ ] `getProfile()` returns profile data
- [ ] Profile page displays correctly

---

## Contact Smart Contract Team

**Questions to Ask**:
1. Is the contract paused?
2. Is there a whitelist? If yes, is user whitelisted?
3. Are there any access control restrictions?
4. What's the expected gas cost?
5. Can you check why transaction `0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70` failed?

**Information to Provide**:
- User address: (from Privy)
- Transaction hash: `0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70`
- Contract address: `0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321`
- Network: Base (Chain ID: 8453)
- Function called: `register()`

---

## Next Steps

1. **Check BaseScan** for exact revert reason
2. **Test hasProfile()** to see if user already registered
3. **Verify network** - Make sure on Base, not Ethereum
4. **Check ETH balance** - Need gas for transaction
5. **Contact contract team** if issue persists

---

**Updated**: January 29, 2025  
**Status**: Investigating transaction failure  
**Priority**: HIGH - User cannot create profile
