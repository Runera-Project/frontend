# JWT Signing Fix for Embedded Wallets

## Problem
Users logging in with Google/Email (embedded wallets) were unable to authenticate with the backend because the JWT signing was failing with error: `wallet.signMessage is not a function`.

## Root Cause
The Privy SDK's wallet object doesn't have a direct `signMessage()` method. Instead, we need to:
1. Get the Ethereum provider from the wallet using `wallet.getEthereumProvider()`
2. Use the provider's `request()` method with `personal_sign` to sign messages
3. Convert the message to hex format before signing (EIP-1193 requirement)

## Solution

### Updated `hooks/useJWTAuth.ts`

Changed from:
```typescript
const signature = await wallet.signMessage(message); // ❌ This method doesn't exist
```

To:
```typescript
// Get the EIP-1193 provider
const provider = await wallet.getEthereumProvider();

// Sign using personal_sign (message can be plain text)
const signature = await provider.request({
  method: 'personal_sign',
  params: [message, walletAddress],
}) as string;
```

## How It Works

1. **Get Provider**: `wallet.getEthereumProvider()` returns an EIP-1193 compatible provider
2. **Sign**: Use `personal_sign` method with plain text message (provider handles hex conversion)
3. **Verify**: Backend uses ethers.js `verifyMessage()` which recovers the signer address

## Compatibility

This solution works for:
- ✅ Embedded wallets (Google/Email login via Privy)
- ✅ External wallets (MetaMask, WalletConnect, etc.)
- ✅ All EIP-1193 compatible providers

## Testing

To test:
1. Login with Google/Email (creates embedded wallet)
2. Check console for "✅ Message signed successfully"
3. Verify JWT token is saved to localStorage
4. Check home page shows "Authenticated with backend" banner

## Backend Verification

The backend uses:
```javascript
const recovered = verifyMessage(message, signature);
```

This works because:
- `personal_sign` adds the Ethereum message prefix: `\x19Ethereum Signed Message:\n${message.length}${message}`
- `verifyMessage` expects this format and recovers the signer address
- The recovered address is compared with the wallet address

## References

- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
- [Privy Wallet Documentation](https://docs.privy.io/guide/react/wallets/usage)
- [ethers.js verifyMessage](https://docs.ethers.org/v6/api/utils/#verifyMessage)
