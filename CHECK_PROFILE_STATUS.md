# 🔍 Check Profile Status - Manual Testing

## Quick Check

### Step 1: Get Your Wallet Address
```
1. Login to app
2. Open browser console (F12)
3. Type: window.ethereum.selectedAddress
4. Copy the address
```

### Step 2: Check on BaseScan
```
1. Go to: https://basescan.org/address/YOUR_WALLET_ADDRESS
2. Click "Token" tab
3. Look for "Runera Profile NFT" or similar
4. If you see it → You already have profile!
```

### Step 3: Check Contract Directly
```
1. Go to: https://basescan.org/address/0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321#readContract
2. Find "hasProfile" function
3. Enter your wallet address
4. Click "Query"
5. Result:
   - true → You have profile
   - false → You don't have profile
```

---

## Check Transaction Status

### Your Failed Transaction:
**Hash**: `0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70`

**Check it here**:
```
https://basescan.org/tx/0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70
```

**What to Look For**:
1. **Status**: Should show "Failed" or "Success"
2. **Error Message**: Look for revert reason
3. **Gas Used**: Check if ran out of gas
4. **Input Data**: Verify function call is correct

---

## Common Scenarios

### Scenario 1: Transaction Failed BUT Profile Created
**Possible**: Transaction failed but state was already changed  
**Check**: 
```
1. Go to contract on BaseScan
2. Check "hasProfile" with your address
3. If true → Profile exists despite failed tx
```

**Solution**: 
- Refresh the app
- Modal should disappear
- Profile should load

### Scenario 2: Transaction Failed AND No Profile
**Possible**: Transaction reverted before creating profile  
**Check**: 
```
1. Check "hasProfile" → should be false
2. Check error message on BaseScan
3. Check ETH balance
```

**Solution**:
- Fix the issue (add ETH, switch network, etc.)
- Try again

### Scenario 3: Multiple Failed Transactions
**Possible**: Trying to register when already registered  
**Check**:
```
1. Check "hasProfile" → might be true
2. Check wallet NFTs on BaseScan
```

**Solution**:
- If hasProfile is true → Just refresh app
- If hasProfile is false → Check error message

---

## Debug in Browser Console

### Check if User Has Profile
```javascript
// Open browser console (F12)
// Make sure you're logged in

// Get your address
const address = window.ethereum.selectedAddress;
console.log('Your address:', address);

// Check if you have profile (need to be on the app page)
// The app should show this in console when loading
```

### Check Network
```javascript
// Check current network
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
console.log('Chain ID:', chainId);
console.log('Expected: 0x2105 (Base = 8453)');

// If wrong network, switch to Base
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x2105' }],
});
```

### Check ETH Balance
```javascript
// Check ETH balance
const balance = await window.ethereum.request({
  method: 'eth_getBalance',
  params: [window.ethereum.selectedAddress, 'latest'],
});

const ethBalance = parseInt(balance, 16) / 1e18;
console.log('ETH Balance:', ethBalance);
console.log('Need at least 0.001 ETH for gas');
```

---

## Manual Contract Interaction

### Using BaseScan Write Contract
```
1. Go to: https://basescan.org/address/0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321#writeContract
2. Click "Connect to Web3"
3. Connect your wallet
4. Find "register" function
5. Click "Write"
6. Approve transaction
7. Wait for confirmation
```

**Note**: Only do this if you're sure you don't have a profile yet!

---

## Expected Behavior

### If You DON'T Have Profile:
```
1. Login to app
2. Modal appears: "Create Your Profile"
3. Click "Create Profile NFT"
4. Wallet prompts for approval
5. Transaction sent
6. Wait for confirmation
7. Success modal appears
8. Profile loads automatically
```

### If You ALREADY Have Profile:
```
1. Login to app
2. NO modal appears
3. Profile page shows your data:
   - Tier badge (Bronze/Silver/Gold/etc.)
   - Stats (distance, activities, pace)
   - Progress to next tier
```

---

## Troubleshooting Steps

### Step 1: Clear Cache
```
1. Close app
2. Clear browser cache
3. Reopen app
4. Login again
```

### Step 2: Check hasProfile
```
1. Go to BaseScan contract
2. Read "hasProfile" with your address
3. If true → You have profile, just refresh
4. If false → Try to register again
```

### Step 3: Check Network
```
1. Open wallet
2. Check network is "Base"
3. If not, switch to Base
4. Try again
```

### Step 4: Check ETH Balance
```
1. Open wallet
2. Check ETH balance on Base
3. If < 0.001 ETH, add more
4. Try again
```

### Step 5: Check Transaction History
```
1. Go to BaseScan with your address
2. Check recent transactions
3. Look for failed "register" calls
4. Read error messages
```

---

## What to Report

If issue persists, report these details:

### User Information:
- **Wallet Address**: (your address)
- **Network**: Base (Chain ID: 8453)
- **ETH Balance**: (your balance)

### Transaction Information:
- **Transaction Hash**: `0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70`
- **Status**: Failed
- **Error Message**: (from BaseScan)

### Contract Information:
- **Contract Address**: `0xa26dD3dbD2d2D08a2AAb43B638643dDd1Ec55321`
- **Function Called**: `register()`
- **hasProfile Result**: (true/false)

### Browser Information:
- **Browser**: (Chrome/Firefox/etc.)
- **Wallet**: (MetaMask/Coinbase/etc.)
- **Console Errors**: (any errors in console)

---

## Quick Fix Commands

### Force Refresh Profile Status
```javascript
// In browser console on app page
window.location.reload();
```

### Clear Local Storage
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### Disconnect and Reconnect Wallet
```
1. Click logout in app
2. Disconnect wallet from site
3. Close browser
4. Reopen and login again
```

---

**Next**: Check your transaction on BaseScan and report the error message!

**Link**: https://basescan.org/tx/0x84cd6fae4c0189bc934605bfe91ac239b5cfd1321624f8dc0165d931ee30ce70
