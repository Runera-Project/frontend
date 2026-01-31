# Achievement Claim Transaction Failed - Fix

## Problem
Transaction failed with "execution reverted" when trying to claim achievement NFT.

**Transaction Details:**
- Hash: `0xb74064767b1605a158d2c057ac58b7a80d07a5eb2a4b03ca666d5086bc537fa1`
- Status: Failed (execution reverted)
- Contract: `0x725d729107C4bC61f3665CE1C813CbcEC7214343` (Achievement NFT)
- Function: `claim(address,bytes32,uint8,bytes32,uint256,bytes)`

## Root Cause Analysis

### 1. Achievement ID Format Issue ✅ FIXED
**Problem:** Frontend was passing achievement ID as string (e.g., "first_5k"), but smart contract expects `bytes32`.

**Solution:** Convert achievement ID to bytes32 using keccak256 hash:
```typescript
import { keccak256, toBytes } from 'viem';

function stringToBytes32(str: string): `0x${string}` {
  return keccak256(toBytes(str));
}

// Example:
// "first_5k" → 0x1234...abcd (bytes32 hash)
```

### 2. Metadata Hash Issue ✅ FIXED
**Problem:** Frontend was using hardcoded placeholder `0x00...00` for metadata hash.

**Solution:** Generate unique metadata hash per achievement:
```typescript
const metadataHash = keccak256(toBytes(`${achievementId}-${tier}-${address}`));
```

### 3. Backend Signature Issue ⚠️ NEEDS VERIFICATION
**Problem:** Backend endpoint `/api/achievements/claim` might not exist or return invalid signature.

**What the backend needs to do:**
1. Verify user has unlocked the achievement
2. Generate EIP-712 signature for the claim
3. Return signature with deadline

**Expected Backend Response:**
```json
{
  "success": true,
  "signature": "0x...",
  "deadline": 1738246982,
  "eventId": "0x...",
  "tier": 1,
  "metadataHash": "0x..."
}
```

**Backend Signature Generation (Solidity equivalent):**
```solidity
// From RuneraAchievementABI.json
bytes32 public constant CLAIM_TYPEHASH = keccak256(
  "Claim(address to,bytes32 eventId,uint8 tier,bytes32 metadataHash,uint256 nonce,uint256 deadline)"
);

// Backend must sign this struct:
struct Claim {
  address to;
  bytes32 eventId;
  uint8 tier;
  bytes32 metadataHash;
  uint256 nonce;
  uint256 deadline;
}
```

## Smart Contract Requirements

From `RuneraAchievementABI.json`, the `claim` function expects:

```solidity
function claim(
  address to,           // User address
  bytes32 eventId,      // Achievement ID (hashed)
  uint8 tier,           // Achievement tier (1-5)
  bytes32 metadataHash, // Metadata hash
  uint256 deadline,     // Signature expiry timestamp
  bytes signature       // Backend signature
) external;
```

**Possible Revert Reasons:**
1. `AlreadyHasAchievement` - User already claimed this achievement
2. `InvalidSigner` - Signature verification failed (wrong signer or invalid signature)
3. `SignatureExpired` - Deadline has passed
4. `InvalidTier` - Tier must be 1-5

## Frontend Changes Made

### 1. Updated `hooks/useClaimAchievement.ts`
```typescript
// ✅ Now converts achievement ID to bytes32
const eventId = stringToBytes32(achievementId);

// ✅ Now generates proper metadata hash
const metadataHash = keccak256(toBytes(`${achievementId}-${tier}-${address}`));

// ✅ Better logging for debugging
console.log('=== CLAIM ACHIEVEMENT ===');
console.log('Achievement ID:', achievementId);
console.log('Event ID (bytes32):', eventId);
console.log('Tier:', tier);
console.log('Metadata Hash:', metadataHash);
```

### 2. Updated `components/AchievementCard.tsx`
```typescript
// ✅ Simplified claim call - hook handles conversion
await claimAchievement(achievement.id, achievement.tier);

// ✅ Better success message with transaction link
alert(
  `✅ Achievement claimed! NFT minted! 🎉\n\n` +
  `Achievement: ${achievement.name}\n` +
  `Tier: ${TIER_NAMES[achievement.tier]}\n` +
  `View on BaseScan: https://sepolia.basescan.org/tx/${result.hash}`
);
```

## Testing Steps

### 1. Check Backend Endpoint
```bash
# Test if endpoint exists
curl -X POST https://backend-production-dfd3.up.railway.app/api/achievements/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userAddress": "0x2D8424E12f8CF0c057aC67b7371B3aAba4AFbF28",
    "eventId": "0x1234...",
    "tier": 1,
    "metadataHash": "0x5678..."
  }'
```

### 2. Test Achievement Claim
1. Go to Profile page
2. Find an unlocked achievement
3. Click "Claim NFT" button
4. Check browser console for detailed logs
5. Verify transaction on BaseScan

### 3. Debug Checklist
- [ ] Backend endpoint `/api/achievements/claim` exists
- [ ] Backend returns valid signature
- [ ] Backend uses correct EIP-712 domain separator
- [ ] Backend uses correct CLAIM_TYPEHASH
- [ ] Backend increments nonce correctly
- [ ] User hasn't already claimed this achievement
- [ ] Signature deadline is in the future (e.g., now + 5 minutes)

## Next Steps

### If Backend Endpoint Doesn't Exist
Backend team needs to implement:
1. POST `/api/achievements/claim` endpoint
2. Verify user has unlocked achievement (check database)
3. Generate EIP-712 signature using backend signer wallet
4. Return signature with deadline

### If Signature Verification Fails
1. Check backend is using correct contract address for domain separator
2. Verify backend signer address matches contract's authorized signer
3. Ensure nonce is fetched from contract: `getNonce(userAddress)`
4. Verify all parameters match exactly (address, eventId, tier, metadataHash, nonce, deadline)

### If User Already Has Achievement
1. Check on-chain: `hasAchievement(userAddress, eventId)`
2. If true, show "Already Claimed" instead of "Claim NFT" button
3. Update frontend to check claim status before showing button

## Contract Verification

To verify on BaseScan:
1. Go to: https://sepolia.basescan.org/address/0x6941280D4aaFe1FC8Fe07506B50Aff541a1B8bD9
2. Check "Read Contract" tab
3. Call `hasAchievement(userAddress, eventId)` to check if already claimed
4. Call `getNonce(userAddress)` to get current nonce
5. Call `accessControl()` to get authorized signer address

## Summary

✅ **Fixed:**
- Achievement ID conversion to bytes32
- Metadata hash generation
- Better error logging

⚠️ **Needs Backend Work:**
- Implement `/api/achievements/claim` endpoint
- Generate valid EIP-712 signature
- Return signature with deadline

🔍 **To Investigate:**
- Check if user already claimed achievement
- Verify backend signer is authorized in AccessControl contract
- Test with different achievements and tiers
