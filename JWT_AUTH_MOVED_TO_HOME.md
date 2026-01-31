# JWT Authentication Moved to Home Page

## Date: January 31, 2026

## Change Summary
Moved JWT authentication from Login Page to Home Page for better user experience and cleaner separation of concerns.

## Why This Change?

### Before (Login Page Authentication)
```
User Flow:
1. User clicks "Sign In" on Login Page
2. Privy authentication modal appears
3. User connects wallet
4. JWT authentication starts IMMEDIATELY
5. User must sign message for JWT
6. User redirected to Home Page

Problems:
❌ Two signature requests in quick succession (Privy + JWT)
❌ Confusing for users - why sign twice?
❌ If JWT fails, user is stuck on login page
❌ Login page has too many responsibilities
```

### After (Home Page Authentication)
```
User Flow:
1. User clicks "Sign In" on Login Page
2. Privy authentication modal appears
3. User connects wallet
4. User redirected to Home Page ✅
5. JWT authentication starts on Home Page
6. User signs message for JWT (if needed)
7. User can use app

Benefits:
✅ Cleaner separation: Login = Privy, Home = JWT
✅ User sees home page before JWT authentication
✅ Better error handling with visual feedback
✅ JWT authentication can be retried without re-login
✅ More intuitive user experience
```

## Implementation

### 1. Created Custom Hook: `hooks/useJWTAuth.ts`

```typescript
export function useJWTAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-authenticate when wallet is connected
    // Validates JWT token matches current wallet
    // Handles token expiration
    // Clears mismatched tokens
  }, [address, isConnected, signMessageAsync]);

  return { isAuthenticating, isAuthenticated, error };
}
```

**Features:**
- ✅ Automatic authentication when wallet connected
- ✅ Validates JWT wallet matches current wallet
- ✅ Checks token expiration
- ✅ Clears invalid/expired tokens
- ✅ Returns authentication state and errors
- ✅ Reusable across components

### 2. Updated Home Page: `app/page.tsx`

```typescript
export default function Home() {
  const { address } = useAccount();
  const { isAuthenticating, isAuthenticated, error } = useJWTAuth();

  return (
    <AuthGuard>
      {/* Authentication Status Banners */}
      {isAuthenticating && <AuthenticatingBanner />}
      {error && <ErrorBanner error={error} />}
      {isAuthenticated && <SuccessBanner />}
      
      {/* Rest of home page */}
      <Header />
      <QuestCard />
      <RecentRun />
    </AuthGuard>
  );
}
```

**Visual Feedback:**
- 🔵 Blue banner: "Authenticating... Please sign the message"
- 🟡 Yellow banner: "Authentication Warning" (with error message)
- 🟢 Green banner: "Authenticated with backend"

### 3. Simplified Login Page: `app/login/page.tsx`

**Removed:**
- ❌ JWT authentication logic
- ❌ `useAccount` hook
- ❌ `useSignMessage` hook
- ❌ `requestNonce` and `connectWallet` calls
- ❌ `isAuthenticating` state
- ❌ "Authenticating..." UI

**Kept:**
- ✅ Privy authentication only
- ✅ Simple "Sign In" button
- ✅ Redirect to home after Privy login

## User Experience Flow

### Scenario 1: First Time Login
```
1. User on Login Page
   → Clicks "Sign In"
   
2. Privy Modal Opens
   → User connects wallet (MetaMask/Email/Google)
   → Signs Privy authentication
   
3. Redirected to Home Page
   → Blue banner appears: "Authenticating..."
   → JWT authentication starts
   
4. Wallet Signature Request
   → User signs message for JWT
   
5. Home Page Fully Loaded
   → Green banner: "Authenticated with backend"
   → User can use all features
```

### Scenario 2: Returning User (Valid JWT)
```
1. User on Login Page
   → Clicks "Sign In"
   
2. Privy Modal Opens
   → User connects wallet
   
3. Redirected to Home Page
   → JWT hook checks localStorage
   → Finds valid JWT for current wallet
   → Green banner: "Authenticated with backend"
   → NO signature request needed ✅
```

### Scenario 3: Wallet Switch
```
1. User logged in with Wallet A
   → JWT token for Wallet A exists
   
2. User switches to Wallet B in MetaMask
   → Refreshes page
   
3. Home Page Loads
   → JWT hook detects wallet mismatch
   → Clears old JWT token
   → Blue banner: "Authenticating..."
   → Requests signature for Wallet B
   
4. User signs message
   → New JWT for Wallet B saved
   → Green banner: "Authenticated with backend"
```

### Scenario 4: JWT Authentication Fails
```
1. User on Home Page
   → JWT authentication starts
   
2. Backend Error (network/server issue)
   → Yellow banner: "Authentication Warning"
   → Shows error message
   → "You can still use the app, but some features may be limited"
   
3. User Can Still Use App
   → Can view profile
   → Can see events
   → Cannot submit runs (requires JWT)
   
4. User Can Retry
   → Refresh page to retry authentication
   → Or logout and login again
```

## Authentication State Management

### JWT Token Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    JWT Token States                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. NO TOKEN                                            │
│     → isAuthenticating: true                            │
│     → Request nonce → Sign message → Get JWT           │
│                                                          │
│  2. VALID TOKEN (correct wallet, not expired)           │
│     → isAuthenticated: true                             │
│     → Skip authentication                               │
│                                                          │
│  3. EXPIRED TOKEN                                       │
│     → Clear token → Request new authentication          │
│                                                          │
│  4. MISMATCHED TOKEN (different wallet)                 │
│     → Clear token → Request new authentication          │
│                                                          │
│  5. AUTHENTICATION ERROR                                │
│     → error: "error message"                            │
│     → User can continue with limited features           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Token Validation Logic

```typescript
// Check 1: Token exists?
const token = localStorage.getItem('runera_token');
if (!token) → Authenticate

// Check 2: Token valid format?
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
} catch → Clear token → Authenticate

// Check 3: Token expired?
if (payload.exp < now) → Clear token → Authenticate

// Check 4: Token wallet matches current wallet?
if (payload.walletAddress !== currentWallet) → Clear token → Authenticate

// All checks passed
→ Use existing token ✅
```

## Files Modified

### Created
1. ✅ `hooks/useJWTAuth.ts` - Reusable JWT authentication hook

### Modified
1. ✅ `app/page.tsx` - Added JWT authentication with visual feedback
2. ✅ `app/login/page.tsx` - Removed JWT logic, simplified to Privy only
3. ✅ `components/Header.tsx` - Already has logout with JWT cleanup (from previous fix)

### Documentation
1. ✅ `JWT_AUTH_MOVED_TO_HOME.md` - This file

## Benefits

### For Users
- ✅ Clearer authentication flow
- ✅ Visual feedback on authentication status
- ✅ Can see home page before JWT authentication
- ✅ Better error messages
- ✅ Can retry authentication without re-login

### For Developers
- ✅ Cleaner code separation
- ✅ Reusable authentication hook
- ✅ Easier to debug (authentication happens on home page)
- ✅ Better error handling
- ✅ Can add JWT authentication to other pages easily

### For Maintenance
- ✅ Single source of truth for JWT logic (`useJWTAuth` hook)
- ✅ Easy to update authentication logic
- ✅ Easy to add authentication to new pages
- ✅ Consistent authentication behavior across app

## Testing Checklist

### Test 1: First Time Login
- [ ] Login with new wallet
- [ ] Should see blue "Authenticating..." banner on home page
- [ ] Should be prompted to sign message
- [ ] Should see green "Authenticated" banner after signing
- [ ] Should be able to submit runs

### Test 2: Returning User
- [ ] Login with wallet that has valid JWT
- [ ] Should NOT be prompted to sign message
- [ ] Should see green "Authenticated" banner immediately
- [ ] Should be able to submit runs

### Test 3: Wallet Switch
- [ ] Login with Wallet A
- [ ] Logout
- [ ] Login with Wallet B
- [ ] Should see blue "Authenticating..." banner
- [ ] Should be prompted to sign message
- [ ] Should see green "Authenticated" banner
- [ ] Should be able to submit runs with Wallet B

### Test 4: Token Expiration
- [ ] Login and get JWT token
- [ ] Manually set token expiration to past (in localStorage)
- [ ] Refresh page
- [ ] Should detect expired token
- [ ] Should request new authentication
- [ ] Should get new valid token

### Test 5: Error Handling
- [ ] Disconnect backend (or use invalid backend URL)
- [ ] Login
- [ ] Should see yellow "Authentication Warning" banner
- [ ] Should show error message
- [ ] Should still be able to view home page
- [ ] Should NOT be able to submit runs

### Test 6: Multiple Tabs
- [ ] Open app in Tab 1, login
- [ ] Open app in Tab 2
- [ ] Should use same JWT token
- [ ] Logout in Tab 1
- [ ] Tab 2 should detect logout (on next action)

## Troubleshooting

### Issue: "Authenticating..." banner never disappears
**Cause:** Backend is down or unreachable
**Solution:** 
1. Check backend URL in `.env.local`
2. Check backend logs on Railway
3. Verify network connection

### Issue: Keeps asking to sign message on every page load
**Cause:** JWT token not being saved to localStorage
**Solution:**
1. Check browser console for errors
2. Verify `connectWallet` function saves token
3. Check if localStorage is blocked (private browsing)

### Issue: "Authentication Warning" appears
**Cause:** Backend authentication failed
**Solution:**
1. Check error message in yellow banner
2. Check browser console for detailed error
3. Try refreshing page to retry
4. If persists, logout and login again

### Issue: Can't submit runs after authentication
**Cause:** JWT token might be invalid or wallet mismatch
**Solution:**
1. Open `DEBUG_JWT_WALLET.html` to check token
2. Verify token wallet matches current wallet
3. Clear localStorage and re-authenticate
4. Check backend logs for ERR_WALLET_MISMATCH

## Next Steps

### Optional Enhancements
1. Add retry button in error banner
2. Add manual "Re-authenticate" button in settings
3. Show JWT expiration time in debug panel
4. Add toast notifications for authentication events
5. Persist authentication state across tabs (BroadcastChannel)

### Future Improvements
1. Implement refresh token mechanism
2. Add biometric authentication option
3. Support multiple wallets per user
4. Add session management dashboard
5. Implement automatic token refresh before expiration

## Success Criteria

✅ User can login without seeing JWT authentication on login page
✅ JWT authentication happens on home page with visual feedback
✅ User sees clear status of authentication (authenticating/success/error)
✅ Multiple wallets work correctly (each gets own JWT)
✅ Token validation prevents wallet mismatch errors
✅ Error handling allows user to continue with limited features
✅ Code is cleaner and more maintainable
