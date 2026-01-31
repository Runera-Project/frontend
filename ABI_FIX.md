# ABI Files Fix - IMPORTANT

## ⚠️ Problem yang Terjadi

ABI files yang ada sebelumnya adalah output dari Foundry dalam format **ASCII table**, bukan JSON yang valid. Ini menyebabkan error:

```
Unable to make a module from invalid JSON: expected value at line 2 column 1
```

## ✅ Solution

Saya sudah membuat ABI files baru dalam format JSON yang benar. Namun, **ini adalah placeholder/template** dengan fungsi-fungsi utama saja.

## 🔴 CRITICAL - Anda Harus Mendapatkan ABI yang Benar

### Cara Mendapatkan ABI JSON yang Benar:

#### Option 1: Dari Foundry Project (Recommended)
```bash
# Di folder smart contract project
cd path/to/SmartContract

# Build contracts
forge build

# ABI JSON ada di:
out/RuneraProfileDynamicNFT.sol/RuneraProfileDynamicNFT.json
out/RuneraCosmeticNFT.sol/RuneraCosmeticNFT.json
out/RuneraAchievementDynamicNFT.sol/RuneraAchievementDynamicNFT.json
out/RuneraEventRegistry.sol/RuneraEventRegistry.json
out/RuneraMarketplace.sol/RuneraMarketplace.json

# Copy abi array dari file-file tersebut
# Cari key "abi" di dalam JSON, copy array-nya
```

#### Option 2: Dari BaseScan (Jika sudah deployed)
```
1. Go to BaseScan: https://basescan.org
2. Search contract address
3. Go to "Contract" tab
4. Click "Code"
5. Scroll to "Contract ABI"
6. Copy JSON array
```

#### Option 3: Dari Smart Contract Team
Minta file ABI JSON langsung dari team yang deploy contract.

---

## 📝 Format ABI yang Benar

ABI harus berupa **JSON array** dengan format seperti ini:

```json
[
  {
    "type": "function",
    "name": "hasProfile",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "register",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
]
```

**BUKAN** format table seperti ini:
```
╭-------------+-------------------+----------╮
| Type        | Signature         | Selector |
+=============================================+
| function    | hasProfile()      | 0x...    |
╰-------------+-------------------+----------╯
```

---

## 🔧 Cara Replace ABI Files

### Step 1: Get Correct ABI
Dapatkan ABI JSON yang benar dari salah satu option di atas.

### Step 2: Replace Files
Replace file-file di folder `ABI/`:

```bash
# Delete current placeholder files
rm ABI/*.json

# Copy correct ABI files
# Dari Foundry out/ folder:
cp path/to/SmartContract/out/RuneraProfileDynamicNFT.sol/RuneraProfileDynamicNFT.json ABI/RuneraProfileDynamicNFTABI.json

# Atau manual copy-paste content
```

### Step 3: Extract ABI Array
Jika file dari Foundry, extract hanya `abi` array:

```javascript
// File dari Foundry biasanya seperti ini:
{
  "abi": [ /* ABI array */ ],
  "bytecode": { /* ... */ },
  "deployedBytecode": { /* ... */ }
}

// Yang kita butuhkan hanya array di dalam "abi"
// Copy array tersebut ke file ABI/RuneraProfileDynamicNFTABI.json
```

### Step 4: Verify Format
Pastikan file ABI adalah **array** yang dimulai dengan `[` dan diakhiri dengan `]`:

```json
[
  { "type": "function", ... },
  { "type": "event", ... }
]
```

---

## 🧪 Testing ABI Files

### Test 1: Check JSON Valid
```bash
# Windows PowerShell
Get-Content ABI/RuneraProfileDynamicNFTABI.json | ConvertFrom-Json

# Jika error, berarti JSON tidak valid
```

### Test 2: Check in Code
```typescript
// lib/contracts.ts
// ⚠️ JANGAN GUNAKAN INI - ABI LAMA
// import ProfileABI from '@/ABI/RuneraProfileDynamicNFTABI.json';

// ✅ GUNAKAN INI - ABI2 YANG BENAR
import ProfileABI from '@/ABI2/RuneraProfileABI.json';

console.log('ABI loaded:', ProfileABI);
console.log('First item:', ProfileABI[0]);
```

### Test 3: Run Dev Server
```bash
pnpm dev

# Jika tidak ada error "Unable to make a module from invalid JSON"
# Berarti ABI files sudah benar
```

---

## 📋 Current ABI Files Status

### ✅ Format: Valid JSON
Semua file sekarang dalam format JSON yang benar.

### ⚠️ Content: Placeholder/Incomplete
File-file ini hanya berisi fungsi-fungsi utama sebagai placeholder. Anda perlu replace dengan ABI yang lengkap dari smart contract yang actual.

### Files Created:
- `ABI/RuneraProfileDynamicNFTABI.json` - Profile NFT functions
- `ABI/RuneraCosmeticNFTABI.json` - Cosmetic NFT functions
- `ABI/RuneraAchievementDynamicNFTABI.json` - Achievement NFT functions
- `ABI/RuneraEventRegistryABI.json` - Event registry functions
- `ABI/RuneraMarketplaceABI.json` - Marketplace functions

---

## 🎯 What Functions Are Included (Placeholder)

### RuneraProfileDynamicNFT
- ✅ `hasProfile(address)` - Check if user has profile
- ✅ `getProfile(address)` - Get profile data
- ✅ `register()` - Create profile
- ✅ `getProfileTier(address)` - Get user tier
- ✅ `updateStats(...)` - Update stats with signature
- ⚠️ Missing: Other functions from actual contract

### RuneraCosmeticNFT
- ✅ `getItem(uint256)` - Get item details
- ✅ `equipItem(category, itemId)` - Equip item
- ✅ `unequipItem(category)` - Unequip item
- ✅ `getEquipped(user, category)` - Get equipped item
- ✅ `balanceOf(user, itemId)` - Check ownership
- ⚠️ Missing: Other functions from actual contract

### RuneraAchievementDynamicNFT
- ✅ `hasAchievement(user, achievementId)` - Check achievement
- ✅ `getUserAchievements(user)` - Get all achievements
- ✅ `getUserAchievementCount(user)` - Get count
- ✅ `claim(...)` - Claim achievement
- ⚠️ Missing: Other functions from actual contract

### RuneraEventRegistry
- ✅ `getEvent(eventId)` - Get event details
- ✅ `getEventCount()` - Get total events
- ✅ `isEventActive(eventId)` - Check if active
- ⚠️ Missing: Other functions from actual contract

### RuneraMarketplace
- ✅ `createListing(...)` - Create listing
- ✅ `buyItem(...)` - Buy item
- ✅ `getListing(listingId)` - Get listing details
- ✅ `cancelListing(listingId)` - Cancel listing
- ⚠️ Missing: Other functions from actual contract

---

## 🚨 Important Notes

1. **Placeholder Only**: Current ABI files are minimal placeholders
2. **Must Replace**: You MUST replace with actual ABI from deployed contracts
3. **Will Work**: Basic functionality (profile registration, tier display) will work with placeholder
4. **May Fail**: Advanced features may fail if ABI is incomplete

---

## 📞 Next Steps

1. **Contact Smart Contract Team**
   - Request ABI JSON files
   - Or request access to Foundry project

2. **Get ABI from Foundry**
   ```bash
   cd path/to/SmartContract
   forge build
   # Copy ABI from out/ folder
   ```

3. **Replace Placeholder Files**
   - Copy correct ABI arrays
   - Paste to ABI/*.json files

4. **Test Integration**
   ```bash
   pnpm dev
   # Test profile registration
   # Verify no errors
   ```

---

**Status**: ABI format fixed ✅, but content is placeholder ⚠️  
**Action Required**: Replace with actual ABI from smart contract team  
**Priority**: HIGH - Needed before production deployment
