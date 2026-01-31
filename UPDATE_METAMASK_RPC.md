# 🔧 UPDATE METAMASK RPC - URGENT!

## ❌ MASALAH SEKARANG

Error: `RPC endpoint returned HTTP client error`

**Penyebab**: MetaMask masih menggunakan RPC lama yang tidak stabil!

---

## ✅ SOLUSI: Update RPC di MetaMask

### Step 1: Buka MetaMask Settings

1. Klik icon MetaMask di browser
2. Klik **Settings** (gear icon)
3. Pilih **Networks**

### Step 2: Edit Base Sepolia Network

1. Cari **Base Sepolia** di list networks
2. Klik untuk edit

### Step 3: Update RPC URL

**Ganti RPC URL dengan Alchemy:**

```
https://base-sepolia.g.alchemy.com/v2/zLbuFi4TN6im35POeM45p
```

**ATAU jika ingin pakai public endpoint yang lebih stabil:**

```
https://base-sepolia-rpc.publicnode.com
```

### Step 4: Save & Test

1. Klik **Save**
2. Tutup dan buka kembali MetaMask
3. Coba submit run lagi

---

## 🎯 KENAPA INI PENTING?

Frontend sudah pakai Alchemy RPC ✅
Backend sudah return signature yang benar ✅
**TAPI MetaMask masih pakai RPC lama** ❌

Ketika MetaMask kirim transaksi, dia pakai RPC yang dikonfigurasi di MetaMask, BUKAN dari frontend!

---

## 📊 VERIFICATION

Setelah update, coba submit run lagi. Seharusnya:

1. ✅ Backend return signature
2. ✅ Frontend kirim transaksi
3. ✅ MetaMask kirim via Alchemy RPC
4. ✅ Transaksi berhasil di blockchain

---

## 🔍 ALTERNATIVE: Cek Nonce Mismatch

Jika masih error setelah update RPC, buka:

```
scripts/check-nonce.html
```

Dan lihat apakah nonce match antara backend dan on-chain.

---

## 📝 CATATAN

Error message "RPC endpoint returned HTTP client error" bisa berarti:

1. **RPC down/overloaded** (paling sering)
2. **Signature invalid** (smart contract reject)
3. **Nonce mismatch** (backend out of sync)

Kita sudah fix #1 di frontend, sekarang perlu fix di MetaMask juga!
