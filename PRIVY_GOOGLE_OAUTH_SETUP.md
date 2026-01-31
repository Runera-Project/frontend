# Privy Google OAuth Setup Guide

## Date: January 31, 2026

## Error
```
Login with Google not allowed
FetchError: [POST] "https://auth.privy.io/api/v1/oauth/init": 403
```

## Root Cause
Google OAuth is not enabled in Privy Dashboard. By default, Privy only enables Email and Wallet login methods.

## Solution

### Option 1: Disable Google Login (Quick Fix - DONE)

**File:** `app/providers.tsx`

```typescript
loginMethods: ['email', 'wallet'], // Removed 'google'
```

**Result:**
- ✅ Users can login with Email
- ✅ Users can login with Wallet (MetaMask)
- ❌ Google login button removed

### Option 2: Enable Google OAuth in Privy Dashboard

Follow these steps to enable Google login:

#### Step 1: Go to Privy Dashboard
1. Visit: https://dashboard.privy.io
2. Login with your Privy account
3. Select your app: **Runera** (App ID: `cmky60ltc00vpl80cuca2k36w`)

#### Step 2: Navigate to Login Methods
1. Click on **"Login Methods"** in left sidebar
2. Or go to: Settings → Login Methods

#### Step 3: Enable Google OAuth
1. Find **"Google"** in the list of login methods
2. Click **"Enable"** or toggle switch to ON
3. You'll see two options:

   **Option A: Use Privy's Google OAuth (Recommended)**
   - ✅ Easiest setup
   - ✅ No Google Cloud Console needed
   - ✅ Privy handles everything
   - ✅ Just click "Enable" and you're done!

   **Option B: Use Your Own Google OAuth**
   - Requires Google Cloud Console setup
   - Need to create OAuth 2.0 credentials
   - More control but more complex

#### Step 4: Configure Redirect URLs (if using Option B)

If you choose to use your own Google OAuth:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Create new project or select existing

2. **Enable Google+ API**
   - Go to: APIs & Services → Library
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Runera"

4. **Add Authorized Redirect URIs**
   ```
   https://auth.privy.io/oauth/callback
   http://localhost:3000 (for local testing)
   ```

5. **Copy Client ID and Secret**
   - Copy the Client ID
   - Copy the Client Secret
   - Paste both in Privy Dashboard

6. **Save in Privy Dashboard**
   - Paste Client ID in Privy
   - Paste Client Secret in Privy
   - Click "Save"

#### Step 5: Test Google Login
1. Restart your dev server: `pnpm dev`
2. Go to login page
3. Click "Continue with Google"
4. Should work now! ✅

## Current Configuration

### Privy App Details
- **App ID:** `cmky60ltc00vpl80cuca2k36w`
- **App Name:** Runera
- **Environment:** Development

### Enabled Login Methods (Current)
- ✅ Email (OTP)
- ✅ Wallet (MetaMask, Coinbase, etc)
- ❌ Google (Disabled - needs dashboard setup)

### Embedded Wallet Configuration
```typescript
embeddedWallets: {
  createOnLogin: 'all-users',
  requireUserPasswordOnCreate: false,
}
```

## Recommended Approach

### For Development (Current)
Use **Email + Wallet** login methods:
- ✅ No additional setup needed
- ✅ Works immediately
- ✅ Embedded wallet created for email users
- ✅ External wallet for MetaMask users

### For Production
Enable **Google OAuth** using Privy's OAuth:
- ✅ Better user experience
- ✅ Familiar login method
- ✅ Higher conversion rate
- ✅ No Google Cloud Console needed

## Testing Checklist

### Test Email Login
- [ ] Go to login page
- [ ] Click "Continue with Email"
- [ ] Enter email address
- [ ] Receive OTP code
- [ ] Enter OTP code
- [ ] Should login successfully ✅
- [ ] Check wallet address appears ✅

### Test Wallet Login
- [ ] Go to login page
- [ ] Click "Connect Wallet"
- [ ] Select MetaMask
- [ ] Approve connection
- [ ] Should login successfully ✅
- [ ] Check wallet address appears ✅

### Test Google Login (After Setup)
- [ ] Go to login page
- [ ] Click "Continue with Google"
- [ ] Select Google account
- [ ] Approve permissions
- [ ] Should login successfully ✅
- [ ] Check embedded wallet created ✅
- [ ] Check wallet address appears ✅

## Troubleshooting

### Issue: "Login with Google not allowed"
**Cause:** Google OAuth not enabled in Privy Dashboard
**Solution:** 
1. Enable Google in Privy Dashboard (Option 2 above)
2. OR remove 'google' from loginMethods (Option 1 - already done)

### Issue: Google login redirects but fails
**Cause:** Redirect URL not configured correctly
**Solution:**
1. Check redirect URLs in Google Cloud Console
2. Ensure `https://auth.privy.io/oauth/callback` is added
3. Check Client ID and Secret are correct

### Issue: "Invalid OAuth client"
**Cause:** Client ID or Secret incorrect
**Solution:**
1. Verify Client ID in Google Cloud Console
2. Verify Client Secret in Google Cloud Console
3. Re-enter in Privy Dashboard

### Issue: Embedded wallet not created for Google users
**Cause:** Embedded wallet config incorrect
**Solution:**
1. Check `createOnLogin: 'all-users'` in providers.tsx
2. Verify Privy Dashboard has embedded wallets enabled
3. Check browser console for errors

## Alternative Login Methods

If you don't want to setup Google OAuth, consider these alternatives:

### 1. Email Login (Already Enabled)
- ✅ No setup needed
- ✅ Works out of the box
- ✅ Creates embedded wallet
- ✅ Secure with OTP

### 2. SMS Login
- Requires Twilio setup
- Good for mobile users
- Creates embedded wallet

### 3. Social Logins
- Twitter/X
- Discord
- Apple
- Each requires dashboard setup

### 4. Wallet Login (Already Enabled)
- ✅ No setup needed
- ✅ Works with MetaMask, Coinbase, etc
- ✅ Uses user's existing wallet

## Security Considerations

### Email Login
- ✅ OTP verification
- ✅ Email ownership verified
- ✅ Embedded wallet encrypted
- ✅ Non-custodial

### Google Login
- ✅ OAuth 2.0 standard
- ✅ Google handles authentication
- ✅ Embedded wallet encrypted
- ✅ Non-custodial

### Wallet Login
- ✅ Signature verification
- ✅ User controls private keys
- ✅ No password needed
- ✅ Non-custodial

## Next Steps

### Immediate (Development)
1. ✅ Use Email + Wallet login (already configured)
2. ✅ Test email login flow
3. ✅ Test wallet login flow
4. ✅ Verify embedded wallets created

### Before Production
1. Enable Google OAuth in Privy Dashboard
2. Test Google login flow
3. Add Terms of Service URL
4. Add Privacy Policy URL
5. Configure custom branding
6. Setup custom domain (optional)

## Files Modified

1. ✅ `app/providers.tsx` - Removed 'google' from loginMethods
2. ✅ `PRIVY_GOOGLE_OAUTH_SETUP.md` - This documentation

## References

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Login Methods Docs](https://docs.privy.io/guide/react/configuration/login-methods)
- [Privy OAuth Setup](https://docs.privy.io/guide/react/configuration/oauth)
- [Google Cloud Console](https://console.cloud.google.com)

---

**Current Status: Email + Wallet login enabled. Google login disabled until dashboard setup complete.**
