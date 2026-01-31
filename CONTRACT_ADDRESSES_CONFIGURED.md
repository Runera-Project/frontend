# ✅ Contract Addresses Configured!

## 🎉 Smart Contract Addresses Added

Contract addresses sudah ditambahkan ke `.env.local`:

```bash
# Access Control
NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS=0x3CDD15E8b7ae1D4df42E4F98F3a62D04777596aa

# Profile NFT (Main contract untuk user profile)
NEXT_PUBLIC_CONTRACT_PROFILE_NFT=0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321

# Achievement NFT
NEXT_PUBLIC_CONTRACT_ACHIEVEMENT_NFT=0x761a26bCB349F002F78a3ecD56378b92c3F3b319

# Cosmetic NFT (untuk skins/items)
NEXT_PUBLIC_CONTRACT_COSMETIC_NFT=0x18Aaa730d09C77C92bCf793dE8FcDEFE48c03A4f

# Marketplace
NEXT_PUBLIC_CONTRACT_MARKETPLACE=0xc91263B231ed03d1F0E6B48818A7D8D6ef7FC2aB

# Event Registry
NEXT_PUBLIC_CONTRACT_EVENT_REGISTRY=0x0cDA043B40cC89E22fa6Fb97c6Aa2F5850D27Dc4
```

---

## 💰 Gas Fees & Token Information

### Network: Base (Layer 2)
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org

### Gas Token: ETH
- **Native token**: ETH (Ethereum)
- **NOT** an ERC20 token
- Used for paying transaction fees (gas)

### Estimated Gas Costs:
```
Profile Registration (mint NFT): ~0.0001 - 0.0005 ETH ($0.30 - $1.50)
Update Stats: ~0.00005 - 0.0002 ETH ($0.15 - $0.60)
Equip Cosmetic: ~0.00003 - 0.0001 ETH ($0.10 - $0.30)
Marketplace Buy: ~0.0001 - 0.0003 ETH ($0.30 - $0.90)
```

**Base network sangat murah** dibanding Ethereum mainnet (100x lebih murah!)

---

## 🔧 How to Get ETH on Base

### Option 1: Bridge from Ethereum
1. Go to https://bridge.base.org
2. Connect wallet
3. Bridge ETH from Ethereum mainnet to Base
4. Wait ~10 minutes for confirmation

### Option 2: Buy on Exchange
1. Buy ETH on exchange (Coinbase, Binance, etc.)
2. Withdraw to Base network
3. Make sure to select "Base" network, NOT Ethereum

### Option 3: Use Faucet (Testnet Only)
If testing on Base Sepolia testnet:
- https://www.alchemy.com/faucets/base-sepolia
- Get free test ETH

---

## 🚀 Next Steps - Ready to Test!

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
pnpm dev
```

**IMPORTANT**: Harus restart agar environment variables ter-load!

### Step 2: Ensure Wallet Has ETH
```
1. Open MetaMask
2. Switch to Base network
3. Check ETH balance
4. If balance = 0, bridge ETH from Ethereum or buy
```

### Step 3: Test Profile Registration
```
1. Open http://localhost:3000
2. Login with Privy
3. Profile registration modal should appear
4. Click "Create Profile NFT"
5. MetaMask will popup
6. Check:
   - Contract address: 0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321 ✓
   - Network: Base ✓
   - Gas fee: ~0.0001 - 0.0005 ETH ✓
7. Approve transaction
8. Wait for confirmation (~2-5 seconds)
9. Profile should load with tier: Bronze
```

---

## 🐛 Troubleshooting

### Error: "User rejected the request"
**Cause**: User clicked "Reject" di MetaMask

**Solution**: Click "Create Profile NFT" again dan approve

---

### Error: "Insufficient funds"
**Cause**: Wallet tidak punya ETH untuk gas

**Solution**: 
1. Bridge ETH ke Base network
2. Atau buy ETH on exchange dan withdraw ke Base

---

### Error: "Contract address is 0x0"
**Cause**: Environment variables belum ter-load

**Solution**:
1. Check `.env.local` ada addresses
2. Restart dev server (Ctrl+C, then `pnpm dev`)
3. Hard refresh browser (Ctrl+Shift+R)

---

### Error: "Wrong network"
**Cause**: Wallet connected ke network lain (Ethereum, Polygon, etc.)

**Solution**:
1. Open MetaMask
2. Click network dropdown
3. Select "Base"
4. If not in list, add Base network:
   - Network Name: Base
   - RPC URL: https://mainnet.base.org
   - Chain ID: 8453
   - Currency: ETH
   - Explorer: https://basescan.org

---

## 📊 Verify Contracts on BaseScan

Check if contracts are deployed and verified:

### Profile NFT:
https://basescan.org/address/0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321

### Cosmetic NFT:
https://basescan.org/address/0x18Aaa730d09C77C92bCf793dE8FcDEFE48c03A4f

### Achievement NFT:
https://basescan.org/address/0x761a26bCB349F002F78a3ecD56378b92c3F3b319

### Marketplace:
https://basescan.org/address/0xc91263B231ed03d1F0E6B48818A7D8D6ef7FC2aB

### Event Registry:
https://basescan.org/address/0x0cDA043B40cC89E22fa6Fb97c6Aa2F5850D27Dc4

---

## ✅ Checklist Before Testing

- [x] Contract addresses added to `.env.local`
- [ ] Dev server restarted
- [ ] Wallet connected to Base network
- [ ] Wallet has ETH for gas (min 0.001 ETH recommended)
- [ ] Browser hard refreshed
- [ ] Ready to test!

---

## 🎯 Expected Behavior

### First Time User:
```
1. Login with Privy ✓
2. Modal appears: "Create Your Profile" ✓
3. Click "Create Profile NFT" ✓
4. MetaMask popup ✓
5. Approve transaction ✓
6. Wait 2-5 seconds ✓
7. Modal closes ✓
8. Profile loads with:
   - Tier: Bronze ✓
   - Total Distance: 0 km ✓
   - Total Activities: 0 ✓
   - Current Streak: 0 ✓
```

### Returning User:
```
1. Login with Privy ✓
2. No modal (already has profile) ✓
3. Profile page shows on-chain data ✓
4. Tier badge displays correctly ✓
```

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Contract address is NOT 0x0000...
- ✅ MetaMask shows correct contract address
- ✅ Transaction confirms on Base network
- ✅ Profile data loads from blockchain
- ✅ Tier badge shows "Bronze Runner"
- ✅ Stats show 0 (for new profile)

---

## 📞 Need Help?

### Check Transaction on BaseScan:
1. Copy transaction hash from MetaMask
2. Go to https://basescan.org
3. Paste hash in search
4. Check transaction status

### Common Issues:
- **Gas too low**: Increase gas limit in MetaMask
- **Transaction failed**: Check contract is deployed
- **Nonce too low**: Reset MetaMask account

---

**Status**: Contract addresses configured ✅  
**Network**: Base (Chain ID: 8453) ✅  
**Gas Token**: ETH ✅  
**Ready to Test**: YES! 🚀

**Next**: Restart dev server dan test profile registration!
