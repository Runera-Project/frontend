# 🔬 FINAL DIAGNOSIS - SIGNATURE VERIFICATION FAILED

## ✅ PROGRESS SO FAR

1. ✅ RPC Error fixed (pakai Alchemy)
2. ✅ Frontend kirim data ke backend
3. ✅ Backend return signature
4. ✅ Nonce correct (backend: 28)
5. ✅ Transaksi berhasil dikirim ke blockchain
6. ❌ **Smart contract REJECT transaksi**

---

## 🔍 EVIDENCE

**Transaction**: 0xe94d6c8a2cb008fbc36c590e2cd45b95ba293ebf4755b22b757ac152bb7c93ba

**Status**: FAIL ❌

**Gas Used**: 64,480 (0.31% of limit)
- Ini SANGAT RENDAH
- Berarti revert terjadi di awal fungsi
- Kemungkinan besar di signature verification

**Pattern**: SEMUA transaksi updateStats gagal dengan gas usage yang sama

---

## 🎯 ROOT CAUSE: BACKEND WALLET NOT AUTHORIZED

### Theory

Smart contract `updateStats()` melakukan checks:

```solidity
function updateStats(
    address user,
    ProfileStats memory stats,
    uint256 deadline,
    bytes memory signature
) external {
    // 1. Check deadline ✅ (passed)
    require(deadline >= block.timestamp, "SignatureExpired");
    
    // 2. Recover signer from signature
    address signer = recoverSigner(user, stats, nonce, deadline, signature);
    
    // 3. Check if signer has BACKEND_ROLE ❌ FAILS HERE!
    require(accessControl.hasRole(BACKEND_ROLE, signer), "InvalidSigner");
    
    // ... rest of code never executed
}
```

**Backend wallet tidak punya BACKEND_ROLE** → Smart contract reject!

---

## 🔧 SOLUTION

### Option 1: Grant BACKEND_ROLE (Recommended)

**Perlu akses ke contract owner wallet!**

```bash
# 1. Get backend wallet address
BACKEND_WALLET="0x..." # Tanya backend developer

# 2. Grant role using owner wallet
cast send 0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa \
  "grantRole(bytes32,address)" \
  $(cast keccak "BACKEND_ROLE") \
  $BACKEND_WALLET \
  --private-key $OWNER_PRIVATE_KEY \
  --rpc-url https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### Option 2: Verify Backend Wallet Address

**Cek apakah backend menggunakan wallet yang benar:**

1. Tanya backend developer: "Wallet address apa yang dipakai untuk sign?"
2. Cek di AccessControl contract apakah address itu punya BACKEND_ROLE
3. Kalau tidak, grant role ke address tersebut

### Option 3: Temporary Workaround

**Kalau tidak bisa grant role sekarang:**

Backend bisa pakai **owner wallet** untuk sign (temporary):
- Owner wallet biasanya sudah punya DEFAULT_ADMIN_ROLE
- Tapi ini NOT RECOMMENDED untuk production!

---

## 📊 VERIFICATION STEPS

### Step 1: Get Backend Wallet Address

Tanya backend developer atau cek backend logs:
```
Backend wallet address: 0x...
```

### Step 2: Check if Backend Wallet Has Role

```bash
cast call 0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa \
  "hasRole(bytes32,address)(bool)" \
  $(cast keccak "BACKEND_ROLE") \
  0xBACKEND_WALLET_ADDRESS \
  --rpc-url https://sepolia.base.org
```

**Expected**: `true`
**If returns**: `false` → **THIS IS THE PROBLEM!**

### Step 3: Grant Role (if needed)

```bash
# Using owner wallet
cast send 0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa \
  "grantRole(bytes32,address)" \
  $(cast keccak "BACKEND_ROLE") \
  0xBACKEND_WALLET_ADDRESS \
  --private-key $OWNER_PRIVATE_KEY \
  --rpc-url https://sepolia.base.org
```

### Step 4: Test Again

Submit run lagi setelah grant role. Seharusnya berhasil!

---

## 🔍 ALTERNATIVE: Verify Signature Locally

Jika ingin memastikan signature valid sebelum kirim ke blockchain:

```typescript
import { verifyTypedData } from 'viem';

const domain = {
  name: 'RuneraProfile',
  version: '1',
  chainId: 84532,
  verifyingContract: '0x725d729107C4bC61f3665CE1C813CbcEC7214343',
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

const message = {
  user: '0x2D8424E12f8CF0c057aC67b7371B3aAba4AFbF28',
  stats: {
    xp: 2900,
    level: 30,
    runCount: 29,
    achievementCount: 0,
    totalDistanceMeters: 90011,
    longestStreakDays: 1,
    lastUpdated: 1769785881,
  },
  nonce: 28,
  deadline: 1769786481,
};

const signature = '0x2120e31378e164c8856ef19cf4aafac8abfeac0be2af2c9f2d00b9d37e236dbc0108b8309c59e3092d05142d9203c0c65cbdad39aa7c1c48c30c13f9ca74e0341c';

const recoveredAddress = await verifyTypedData({
  address: 'EXPECTED_BACKEND_WALLET_ADDRESS',
  domain,
  types,
  primaryType: 'StatsUpdate',
  message,
  signature,
});

console.log('Signature valid:', recoveredAddress);
```

---

## 📝 NEXT STEPS

1. **URGENT**: Hubungi backend developer
   - Tanya: "Wallet address apa yang dipakai untuk sign updateStats?"
   - Cek apakah address itu punya BACKEND_ROLE

2. **Grant Role**: Jika backend wallet belum punya role
   - Perlu akses ke owner wallet
   - Grant BACKEND_ROLE ke backend wallet

3. **Test**: Submit run lagi setelah grant role

4. **Verify**: Cek BaseScan untuk status SUCCESS

---

## 🎯 EXPECTED RESULT

Setelah grant BACKEND_ROLE:

```
✅ Backend sign dengan wallet yang authorized
✅ Smart contract verify signature
✅ Smart contract update stats
✅ Transaction SUCCESS di BaseScan
✅ User XP terupdate on-chain
```

---

## 📞 CONTACT BACKEND DEVELOPER

**Questions to ask:**

1. What wallet address is backend using to sign updateStats?
2. Does that wallet have BACKEND_ROLE in AccessControl contract?
3. Can you verify the signature is being generated correctly?
4. Can you check backend logs for any errors?

**Info to share:**

- Contract Address: 0x725d729107C4bC61f3665CE1C813CbcEC7214343
- AccessControl: 0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa
- Failed TX: 0xe94d6c8a2cb008fbc36c590e2cd45b95ba293ebf4755b22b757ac152bb7c93ba
- Error: Signature verification failed (likely InvalidSigner)

---

## ⏱️ TIMELINE TO FIX

- Get backend wallet address: 5 minutes
- Verify role status: 5 minutes
- Grant role (if needed): 10 minutes
- Test: 5 minutes

**Total**: ~25 minutes to full resolution
