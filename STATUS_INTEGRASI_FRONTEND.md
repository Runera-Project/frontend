# 🎯 Status Integrasi Frontend dengan Smart Contract

**Terakhir Diupdate**: 29 Januari 2026 (Setelah Migrasi ABI2)

---

## ✅ SUDAH SELESAI (Menggunakan Data Real dari Contract)

### 1. Sistem Profile ✅
- ✅ Registrasi profile (`register()`)
- ✅ Ambil data profile (`getProfile()`, `hasProfile()`)
- ✅ Tampilan profile dengan XP, level, tier, stats
- ✅ Kalkulasi tier berdasarkan level
- ✅ Tampilan NFT profile
- ✅ Error handling dan fallback states

**File**: `hooks/useProfile.ts`, `app/profile/page.tsx`, `components/profile/*`

---

## ⚠️ MASIH PAKAI DATA DUMMY (Perlu Integrasi Contract)

### 2. Sistem Event ⚠️
**Status**: UI sudah jadi, tapi masih pakai data dummy yang di-hardcode

**Yang Sudah Jalan**:
- ✅ Tampilan list event
- ✅ Card event dengan countdown
- ✅ Kalkulasi status (upcoming, active, ended)
- ✅ UI tracking participant

**Yang Masih Kurang**:
- ❌ Ambil event real dari contract pakai `getEventCount()` + `getEventIdByIndex()` + `getEvent()`
- ❌ Jumlah participant real-time
- ❌ Fungsi join event

**File**: `hooks/useEvents.ts`, `app/event/page.tsx`, `components/event/*`

**Cara Perbaiki**:
```typescript
// Di useEvents.ts, ganti dummy data dengan:
const { data: eventCount } = useReadContract({
  address: CONTRACTS.EventRegistry,
  abi: ABIS.EventRegistry,
  functionName: 'getEventCount',
});

// Loop semua event dan ambil satu-satu
for (let i = 0; i < eventCount; i++) {
  const eventId = await getEventIdByIndex(i);
  const event = await getEvent(eventId);
  // Tambahkan ke array events
}
```

---

### 3. Sistem Cosmetics ⚠️
**Status**: UI sudah jadi, tapi masih pakai data dummy yang di-hardcode

**Yang Sudah Jalan**:
- ✅ Tampilan cosmetic dengan kategori
- ✅ Fungsi equip/unequip (sudah connect ke contract!)
- ✅ Sistem rarity
- ✅ Filter kategori

**Yang Masih Kurang**:
- ❌ Ambil item cosmetic real pakai `getItem(itemId)`
- ❌ Tampilkan metadata IPFS (gambar, deskripsi)
- ❌ Cek kepemilikan dengan `balanceOf()`
- ❌ Pakai `getAllEquipped()` biar lebih efisien

**File**: `hooks/useCosmetics.ts`, `app/market/page.tsx`, `components/market/*`

**Cara Perbaiki**:
```typescript
// Di useCosmetics.ts, ambil item real:
const { data: item } = useReadContract({
  address: CONTRACTS.CosmeticNFT,
  abi: ABIS.CosmeticNFT,
  functionName: 'getItem',
  args: [itemId],
});

// Cek kepemilikan
const { data: balance } = useReadContract({
  address: CONTRACTS.CosmeticNFT,
  abi: ABIS.CosmeticNFT,
  functionName: 'balanceOf',
  args: [address, itemId],
});
```

---

### 4. Sistem Achievement ⚠️
**Status**: UI sudah jadi, tapi masih pakai data dummy yang di-hardcode

**Yang Sudah Jalan**:
- ✅ Tampilan achievement dengan 17 achievement
- ✅ Tracking progress (dihitung dari stats profile)
- ✅ Kategori dan tier achievement
- ✅ Sistem reward XP
- ✅ Card achievement dengan status lock/unlock

**Yang Masih Kurang**:
- ❌ Ambil achievement yang sudah di-claim pakai `getUserAchievements()`
- ❌ Tampilkan data achievement real pakai `getAchievement()`
- ❌ Fungsi claim achievement dengan `claim()`
- ❌ Tampilan NFT achievement

**File**: `hooks/useAchievements.ts`, `components/AchievementCard.tsx`, `components/profile/AchievementsSection.tsx`

**Cara Perbaiki**:
```typescript
// Di useAchievements.ts, ambil achievement yang sudah di-claim:
const { data: achievementIds } = useReadContract({
  address: CONTRACTS.AchievementNFT,
  abi: ABIS.AchievementNFT,
  functionName: 'getUserAchievements',
  args: [address],
});

// Untuk setiap achievement ID, ambil detailnya:
const { data: achievement } = useReadContract({
  address: CONTRACTS.AchievementNFT,
  abi: ABIS.AchievementNFT,
  functionName: 'getAchievement',
  args: [address, achievementId],
});
```

---

## ❌ BELUM DIIMPLEMENTASI (Perlu Backend + Contract)

### 5. Update Stats Profile ❌
**Status**: Belum diimplementasi (butuh signature dari backend)

**Yang Dibutuhkan**:
- Backend API untuk generate signature EIP-712
- Fungsi frontend untuk panggil `updateStats()` dengan signature
- UI untuk trigger update stats setelah aktivitas

**Fungsi Contract**:
```solidity
updateStats(
  address user,
  ProfileStats stats,
  uint256 deadline,
  bytes signature
)
```

**Prioritas**: 🔴 TINGGI - Penting untuk tracking aktivitas

---

### 6. Claim Achievement ❌
**Status**: Belum diimplementasi (butuh signature dari backend)

**Yang Dibutuhkan**:
- Backend API untuk verifikasi achievement dan generate signature
- Tombol "Claim" di achievement yang sudah unlock
- Flow transaksi dengan loading states

**Fungsi Contract**:
```solidity
claim(
  address to,
  bytes32 eventId,
  uint8 tier,
  bytes32 metadataHash,
  uint256 deadline,
  bytes signature
)
```

**Prioritas**: 🔴 TINGGI - Fitur inti achievement

---

### 7. Marketplace ❌
**Status**: UI ada tapi belum ada integrasi contract

**Yang Dibutuhkan**:
- Buat listing: `createListing(itemId, amount, pricePerUnit)`
- Beli item: `buyItem(listingId, amount)` dengan pembayaran ETH
- Ambil listing: `getListing()`, `getListingsByItem()`, `getListingsBySeller()`
- Cancel listing: `cancelListing(listingId)`

**Prioritas**: 🟡 SEDANG - Fitur marketplace

---

## 📊 Prioritas Integrasi

### Fase 1: Ganti Data Dummy (1-2 hari)
**Tujuan**: Pakai data real dari smart contract

1. **Events** - Ambil event real dari contract
2. **Cosmetics** - Ambil item real dan cek kepemilikan
3. **Achievements** - Ambil achievement yang sudah di-claim

**Dampak**: App akan terasa lebih real, test integrasi contract

---

### Fase 2: Aksi Inti (3-5 hari)
**Tujuan**: Implementasi aksi user yang penting

4. **Update Stats** - Integrasi backend + frontend
5. **Claim Achievements** - Integrasi backend + frontend

**Dampak**: User bisa benar-benar earn dan claim achievement

---

### Fase 3: Marketplace (3-5 hari)
**Tujuan**: Enable jual beli

6. **Marketplace** - Flow beli/jual lengkap

**Dampak**: User bisa trading cosmetics

---

## 🎯 Quick Wins (Bisa Dikerjakan Sekarang!)

### 1. Ambil Event Real (30 menit)
Ganti dummy events di `useEvents.ts` dengan data real dari contract.

### 2. Ambil Cosmetics Real (1 jam)
Ganti dummy cosmetics di `useCosmetics.ts` dengan data real dari contract.

### 3. Ambil Achievement yang Di-claim (1 jam)
Ganti dummy achievements di `useAchievements.ts` dengan data real dari contract.

---

## 📝 Ringkasan

**Status Saat Ini**:
- ✅ Profile: 100% terintegrasi dengan contract
- ⚠️ Events: 50% (UI sudah, perlu data contract)
- ⚠️ Cosmetics: 50% (UI + equip sudah, perlu data item)
- ⚠️ Achievements: 50% (UI + progress sudah, perlu claim + data contract)
- ❌ Update Stats: 0% (perlu backend)
- ❌ Marketplace: 10% (UI saja)

**Langkah Selanjutnya**:
1. Mulai dari Fase 1 (ganti data dummy) - paling mudah dan cepat
2. Lalu Fase 2 (aksi inti) - butuh kerja backend
3. Terakhir Fase 3 (marketplace) - opsional untuk MVP

**Estimasi Waktu**:
- Fase 1: 1-2 hari
- Fase 2: 3-5 hari
- Fase 3: 3-5 hari
- **Total**: 1-2 minggu untuk integrasi penuh

---

## 🔍 Detail Yang Kurang Per Sistem

### Events (useEvents.ts)
**Fungsi Contract yang Tersedia tapi Belum Dipakai**:
- `getEventCount()` - Ambil jumlah total event
- `getEventIdByIndex(index)` - Ambil ID event berdasarkan index
- `getEvent(eventId)` - Ambil detail event
- `isEventActive(eventId)` - Cek apakah event aktif
- `incrementParticipants(eventId)` - Tambah participant (backend only)

**Saat Ini**: Pakai 3 dummy event yang di-hardcode

---

### Cosmetics (useCosmetics.ts)
**Fungsi Contract yang Tersedia tapi Belum Dipakai**:
- `getItem(itemId)` - Ambil detail item cosmetic
- `itemExists(itemId)` - Cek apakah item ada
- `getAllEquipped(user)` - Ambil semua item yang di-equip sekaligus
- `balanceOf(account, id)` - Cek kepemilikan (sudah ada tapi belum dipakai untuk filter)

**Saat Ini**: Pakai 8 dummy cosmetic yang di-hardcode

---

### Achievements (useAchievements.ts)
**Fungsi Contract yang Tersedia tapi Belum Dipakai**:
- `getUserAchievements(user)` - Ambil semua achievement user
- `getUserAchievementCount(user)` - Ambil jumlah achievement user
- `hasAchievement(user, eventId)` - Cek apakah user punya achievement
- `getAchievement(user, eventId)` - Ambil detail achievement
- `getAchievementByTokenId(tokenId)` - Ambil achievement berdasarkan token ID
- `claim(...)` - Claim achievement NFT (butuh backend signature)

**Saat Ini**: Pakai 17 dummy achievement yang di-hardcode, progress dihitung dari profile stats

---

### Profile (useProfile.ts) ✅
**Sudah Terintegrasi Penuh**:
- ✅ `hasProfile(address)` - Cek apakah user punya profile
- ✅ `getProfile(address)` - Ambil data profile
- ✅ `register()` - Buat profile baru
- ✅ `getProfileTier(address)` - Ambil tier user
- ✅ `balanceOf(address, id)` - Cek balance NFT

**Yang Belum**:
- ❌ `updateStats(...)` - Update stats (butuh backend signature)
- ❌ `getNonce(user)` - Ambil nonce untuk signature

---

## 💡 Rekomendasi

**Mulai dari Fase 1** - Ganti data dummy dengan data real dari contract. Ini akan:
- Membuat app terasa lebih real
- Test integrasi contract
- Identifikasi masalah ABI lebih awal
- Memberikan fondasi untuk Fase 2

**Urutan Prioritas**:
1. Events (paling mudah, read-only)
2. Cosmetics (sedang, read + equip)
3. Achievements (kompleks, butuh backend untuk claim)
4. Profile Stats (kompleks, butuh backend)
5. Marketplace (opsional, bisa jadi Fase 3)

---

**Siap untuk implementasi? Mari mulai dari Fase 1!** 🚀
