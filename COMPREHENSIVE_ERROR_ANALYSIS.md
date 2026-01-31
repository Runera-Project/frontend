# 🔍 COMPREHENSIVE ERROR ANALYSIS - RUNERA ONCHAIN SYNC

## 📋 EXECUTIVE SUMMARY

**Problem**: Transaction berhasil dikirim ke blockchain tapi **GAGAL EKSEKUSI** dengan status "Fail" dan error "execution reverted".

**Impact**: 
- ✅ Backend berhasil menyimpan data run
- ✅ Backend berhasil generate signature
- ✅ Frontend berhasil kirim transaksi
- ❌ Smart contract **REJECT** transaksi

**Root Cause Hypothesis**: 
1. **Signature verification failed** (InvalidSigner atau InvalidSignature)
2. **Nonce mismatch** antara backend dan on-chain
3. **Backend wallet tidak punya BACKEND_ROLE** di AccessControl

---

## 🔬 DETAILED ANALYSIS

### 1. TRANSACTION FLOW

```
User Submit Run
    ↓
Frontend → Backend (/run/submit)
    ↓
Backend Validates Run
    ↓
Backend Calculates Stats (XP, Level, etc)
    ↓
Backend Queries On-Chain Nonce ← ⚠️ CRITICAL POINT
    ↓
Backend Signs with EIP-712
    ↓
Backend Returns: {signature, deadline, stats, nonce}
    ↓
Frontend Calls updateStats(user, stats, deadline, signature)
    ↓
Smart Contract Verifies:
    1. Deadline not expired ✅
    2. Signature valid ❌ FAILS HERE
    3. Signer has BACKEND_ROLE ❌ OR FAILS HERE
    4. Nonce matches ❌ OR FAILS HERE
    ↓
Transaction REVERTS
```

### 2. EVIDENCE FROM BASESCAN

**Failed Transactions:**
- 0x1c13dbfc... (6 mins ago) - FAIL
- 0x686bdee6... (1 hr ago) - FAIL  
- 0xfc031757... (1 hr ago) - FAIL
- 0x4c3487ca... (1 hr ago) - FAIL
- 0x0c570189... (1 hr ago) - FAIL
- 0x79863

1c9... (1 hr ago) - FAIL

**Pattern**: ALL updateStats transactions are failing!

**Gas Used**: 64,480 (0.31% of limit)
- This is VERY LOW gas usage
- Indicates early revert (before expensive operations)
- Likely failing at signature verification or access control check

### 3. SMART CONTRACT ANALYSIS

**From ABI (RuneraProfileABI.json):**

```solidity
function updateStats(
    address user,
    ProfileStats memory stats,
    uint256 deadline,
    bytes memory signature
) external;
```

**Possible Revert Reasons:**

1. **InvalidSignature** - Signature doesn't match expected format
2. **InvalidSigner** - Recovered signer is not authorized
3. **SignatureExpired** - deadline < block.timestamp
4. **NotRegistered** - User doesn't have profile
5. **Nonce mismatch** - Backend using wrong nonce

**EIP-712 Signature Structure:**
```typescript
STATS_UPDATE_TYPEHASH = keccak256(
  "StatsUpdate(address user,ProfileStats stats,uint256 nonce,uint256 deadline)"
)
```

### 4. BACKEND SIGNATURE GENERATION

**Current Flow (from logs):**
```json
{
  "onchainSync": {
    "stats": {
      "xp": 2600,
      "level": 27,
      "runCount": 26,
      "achievementCount": 0,
      "totalDistanceMeters": 65011,
      "longestStreakDays": 1,
      "lastUpdated": 1769781565
    },
    "nonce": 25,
    "deadline": 1769782165,
    "signature": "0xea7ce51d9a58cd030b1428e667d3790dc45987f18126f64122aa056c4587295a7ad5c3e9d5226560d6d41fba772d41a2239f2fd5e7cc694be610d2b60057f9df1b"
  }
}
```

**Critical Questions:**
1. ❓ Is backend querying on-chain nonce BEFORE signing?
2. ❓ Is backend wallet authorized with BACKEND_ROLE?
3. ❓ Is EIP-712 domain separator correct?
4. ❓ Is signature format correct (v,r,s)?

### 5. FRONTEND TRANSACTION CALL

**From validate/page.tsx:**
```typescript
await writeContractAsync({
  address: CONTRACTS.ProfileNFT, // 0x725d729107C4bC61f3665CE1C813CbcEC7214343
  abi: ABIS.ProfileNFT,
  functionName: 'updateStats',
  args: [
    address, // 0x2D8424E12f8CF0c057aC67b7371B3aAba4AFbF28
    {
      xp: BigInt(stats.xp),
      level: stats.level,
      runCount: stats.runCount,
      achievementCount: stats.achievementCount,
      totalDistanceMeters: BigInt(stats.totalDistanceMeters),
      longestStreakDays: stats.longestStreakDays,
      lastUpdated: BigInt(stats.lastUpdated),
    },
    BigInt(deadline),
    signature,
  ],
});
```

**Looks correct!** ✅

---

## 🎯 ROOT CAUSE IDENTIFICATION

### MOST LIKELY CAUSE: Nonce Mismatch

**Theory:**
1. Backend stores nonce in database
2. User submits multiple runs quickly
3. First transaction succeeds (nonce increments on-chain)
4. Backend still has old nonce in database
5. Second transaction uses old nonce → FAILS

**Evidence:**
- Multiple failed transactions in short time
- Backend returns `"nonce": 25` but on-chain might be 26
- No error about signature format (would fail differently)

### SECOND LIKELY CAUSE: Backend Wallet Not Authorized

**Theory:**
1. Backend wallet needs BACKEND_ROLE in AccessControl contract
2. Role was not granted during deployment
3. Smart contract rejects signature from unauthorized signer

**Evidence:**
- ALL transactions fail (not just some)
- Consistent failure pattern
- Low gas usage (early revert)

---

## 🔧 DEBUGGING STEPS

### Step 1: Check On-Chain Nonce

```bash
# Open scripts/check-nonce.html in browser
# Or use cast:
cast call 0x725d729107C4bC61f3665CE1C813CbcEC7214343 \
  "getNonce(address)(uint256)" \
  0x2D8424E12f8CF0c057aC67b7371B3aAba4AFbF28 \
  --rpc-url https://sepolia.base.org
```

**Expected**: Should match backend nonce

### Step 2: Check Backend Wallet Role

```bash
# Check if backend wallet has BACKEND_ROLE
cast call 0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa \
  "hasRole(bytes32,address)(bool)" \
  $(cast keccak "BACKEND_ROLE") \
  <BACKEND_WALLET_ADDRESS> \
  --rpc-url https://sepolia.base.org
```

**Expected**: Should return `true`

### Step 3: Verify Signature Locally

```typescript
// In frontend, before sending transaction:
const { verifyTypedData } = await import('viem');

const domain = {
  name: 'RuneraProfile',
  version: '1',
  chainId: 84532,
  verifyingContract: CONTRACTS.ProfileNFT,
};

const types = {
  StatsUpdate: [
    { name: 'user', type: 'address' },
    { name: 'stats', type: 'ProfileStats' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  ProfileStats: [
    { name: 'xp', type: 'uint96' },
    { name: 'level', type: 'uint16' },
    { name: 'runCount', type: 'uint32' },
    { name: 'achievementCount', type: 'uint32' },
    { name: 'totalDistanceMeters', type: 'uint64' },
    { name: 'longestStreakDays', type: 'uint32' },
    { name: 'lastUpdated', type: 'uint64' },
  ],
};

const recoveredAddress = await verifyTypedData({
  address: BACKEND_WALLET_ADDRESS,
  domain,
  types,
  primaryType: 'StatsUpdate',
  message: {
    user: address,
    stats: result.onchainSync.stats,
    nonce: result.onchainSync.nonce,
    deadline: result.onchainSync.deadline,
  },
  signature: result.onchainSync.signature,
});

console.log('Signature valid:', recoveredAddress === BACKEND_WALLET_ADDRESS);
```

### Step 4: Check Profile Registration

```bash
cast call 0x725d729107C4bC61f3665CE1C813CbcEC7214343 \
  "hasProfile(address)(bool)" \
  0x2D8424E12f8CF0c057aC67b7371B3aAba4AFbF28 \
  --rpc-url https://sepolia.base.org
```

**Expected**: Should return `true`

---

## 🛠️ SOLUTIONS

### Solution 1: Fix Nonce Sync (Backend)

**Backend MUST query on-chain nonce before signing:**

```typescript
// ❌ WRONG - Using database nonce
const nonce = user.nonce;

// ✅ CORRECT - Query from blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);
const profileContract = new ethers.Contract(
  PROFILE_CONTRACT_ADDRESS,
  PROFILE_ABI,
  provider
);

const onChainNonce = await profileContract.getNonce(userAddress);
const nonce = Number(onChainNonce);

// Sign with on-chain nonce
const signature = await backendWallet.signTypedData({
  domain,
  types,
  primaryType: 'StatsUpdate',
  message: {
    user: userAddress,
    stats,
    nonce, // Use on-chain nonce!
    deadline,
  },
});
```

### Solution 2: Grant Backend Role (Smart Contract)

**If backend wallet doesn't have BACKEND_ROLE:**

```bash
# Grant role using contract owner wallet
cast send 0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa \
  "grantRole(bytes32,address)" \
  $(cast keccak "BACKEND_ROLE") \
  <BACKEND_WALLET_ADDRESS> \
  --private-key <OWNER_PRIVATE_KEY> \
  --rpc-url https://sepolia.base.org
```

### Solution 3: Add Retry Logic (Frontend)

**If nonce gets out of sync temporarily:**

```typescript
// Retry with fresh nonce from backend
let retries = 3;
while (retries > 0) {
  try {
    const result = await submitRun(runData);
    // ... rest of code
    break;
  } catch (error) {
    if (error.message.includes('nonce') && retries > 1) {
      console.log('Nonce mismatch, retrying...');
      retries--;
      await new Promise(r => setTimeout(r, 2000)); // Wait 2s
      continue;
    }
    throw error;
  }
}
```

---

## 📊 VERIFICATION CHECKLIST

After implementing fixes, verify:

- [ ] Backend queries on-chain nonce before signing
- [ ] Backend wallet has BACKEND_ROLE in AccessControl
- [ ] EIP-712 domain separator matches contract
- [ ] Signature format is correct (65 bytes, 0x prefix)
- [ ] User has registered profile
- [ ] Deadline is in future (at least 10 minutes)
- [ ] Stats values are within valid ranges
- [ ] Test with single transaction first
- [ ] Test with multiple rapid transactions
- [ ] Check BaseScan for SUCCESS status

---

## 🎯 NEXT STEPS

1. **Immediate**: Run debug tools to identify exact issue
   - Use `scripts/check-nonce.html`
   - Check backend wallet role
   - Verify signature locally

2. **Backend Fix**: Implement on-chain nonce query
   - Update signature generation code
   - Test with dummy data
   - Deploy to production

3. **Frontend Enhancement**: Add better error handling
   - Show specific error messages
   - Add retry logic
   - Display nonce mismatch warnings

4. **Testing**: Comprehensive integration test
   - Single run submission
   - Multiple rapid submissions
   - Edge cases (expired deadline, invalid signature)

---

## 📝 CONCLUSION

The issue is **NOT with RPC provider** (that was resolved with Alchemy).

The issue is **WITH SIGNATURE VERIFICATION** in the smart contract, most likely:
1. **Nonce mismatch** (backend using stale nonce)
2. **Backend wallet not authorized** (missing BACKEND_ROLE)

**Priority**: Fix backend nonce synchronization FIRST, then verify backend wallet authorization.

**Timeline**: 
- Debug: 30 minutes
- Fix: 1 hour
- Test: 30 minutes
- Deploy: 15 minutes

**Total**: ~2.5 hours to full resolution
