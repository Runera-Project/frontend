# Backend Nonce Error Fix

## Date: January 31, 2026

## Error
```
Status: 500
Response: {"error":{"code":"ERR_INTERNAL","message":"Failed to create nonce"}}
```

## Root Cause
Backend database (Prisma) failed to create nonce record. This can happen due to:
1. Database connection lost
2. Database table not migrated
3. Railway service restarted/sleeping
4. Database credentials expired

## Immediate Solutions

### Solution 1: Check Backend Status

1. **Open Railway Dashboard:**
   - Go to: https://railway.app
   - Login to your account
   - Select "Runera Backend" project

2. **Check Service Status:**
   - Look for "Backend" service
   - Check if it's running (green status)
   - Check recent logs for errors

3. **Check Database Status:**
   - Look for "PostgreSQL" service
   - Check if it's running (green status)
   - Check connection status

### Solution 2: Restart Backend Service

1. **In Railway Dashboard:**
   - Click on "Backend" service
   - Click "Settings" tab
   - Scroll down to "Service"
   - Click "Restart" button

2. **Wait for restart:**
   - Service will restart (takes 30-60 seconds)
   - Check logs for "Runera backend listening on port 4000"

3. **Test again:**
   - Refresh your frontend
   - Try logging in again

### Solution 3: Check Database Migrations

The backend might need database migrations to be run.

1. **SSH into Railway (if possible):**
   ```bash
   railway run npx prisma migrate deploy
   ```

2. **Or check if migrations ran:**
   - Look in Railway logs for migration messages
   - Should see "Database migrations completed"

### Solution 4: Check Environment Variables

1. **In Railway Dashboard:**
   - Click on "Backend" service
   - Click "Variables" tab
   - Verify these exist:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `BACKEND_SIGNER_PRIVATE_KEY`
     - `PROFILE_NFT_ADDRESS`
     - `CHAIN_ID`

2. **If missing, add them:**
   - Click "New Variable"
   - Add required variables
   - Redeploy service

## Frontend Error Handling (Already Implemented)

### Better Error Messages

**File:** `hooks/useJWTAuth.ts`

```typescript
// Parse error and show user-friendly message
if (errorMessage.includes('Failed to create nonce')) {
  errorMessage = 'Backend database error. Please try again later or contact support.';
} else if (errorMessage.includes('fetch')) {
  errorMessage = 'Cannot connect to backend. Please check your internet connection.';
}
```

### User Experience

**Before:**
```
Error: [object Object]
```

**After:**
```
Backend database error. Please try again later or contact support.
```

## Testing Backend Locally

If you want to test backend locally:

### 1. Navigate to Backend Directory
```bash
cd Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env` file:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
BACKEND_SIGNER_PRIVATE_KEY="0x..."
PROFILE_NFT_ADDRESS="0x725d729107C4bC61f3665CE1C813CbcEC7214343"
CHAIN_ID="84532"
```

### 4. Run Migrations
```bash
npx prisma migrate deploy
```

### 5. Start Backend
```bash
npm start
```

### 6. Test Nonce Endpoint
```bash
curl -X POST http://localhost:4000/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234567890123456789012345678901234567890"}'
```

Should return:
```json
{
  "nonce": "abc123...",
  "expiresAt": "2026-01-31T...",
  "message": "RUNERA login\nNonce: abc123..."
}
```

## Common Backend Errors

### Error 1: "Failed to create nonce"
**Cause:** Database connection issue or table doesn't exist
**Solution:**
1. Check database is running
2. Run migrations: `npx prisma migrate deploy`
3. Restart backend service

### Error 2: "DATABASE_URL is not configured"
**Cause:** Missing environment variable
**Solution:**
1. Add `DATABASE_URL` in Railway variables
2. Redeploy service

### Error 3: "JWT_SECRET is not configured"
**Cause:** Missing environment variable
**Solution:**
1. Add `JWT_SECRET` in Railway variables
2. Redeploy service

### Error 4: Connection timeout
**Cause:** Railway service sleeping (free tier)
**Solution:**
1. Wait 30-60 seconds for service to wake up
2. Try again
3. Consider upgrading to paid tier for always-on

## Monitoring Backend Health

### Health Check Endpoint

Test if backend is alive:
```bash
curl https://backend-production-dfd3.up.railway.app/health
```

Should return:
```json
{
  "status": "ok"
}
```

### Check from Frontend

Add this to your browser console:
```javascript
fetch('https://backend-production-dfd3.up.railway.app/health')
  .then(r => r.json())
  .then(d => console.log('Backend status:', d))
  .catch(e => console.error('Backend error:', e));
```

## Temporary Workaround

If backend is down and you need to test frontend:

### Disable JWT Authentication Temporarily

**File:** `hooks/useJWTAuth.ts`

Add at the top of `authenticateWithBackend`:
```typescript
// TEMPORARY: Skip JWT auth for testing
console.warn('⚠️ JWT authentication disabled for testing');
setIsAuthenticated(false);
setError('Backend unavailable - using local mode');
return;
```

This allows you to:
- ✅ View the app
- ✅ See UI components
- ✅ Test navigation
- ❌ Cannot submit runs (requires JWT)

## Long-term Solutions

### 1. Add Retry Logic

```typescript
// Retry nonce request up to 3 times
let retries = 3;
while (retries > 0) {
  try {
    const { nonce, message } = await requestNonce({ walletAddress });
    break; // Success
  } catch (err) {
    retries--;
    if (retries === 0) throw err;
    await new Promise(r => setTimeout(r, 2000)); // Wait 2s
  }
}
```

### 2. Add Fallback Backend

Configure multiple backend URLs:
```typescript
const BACKEND_URLS = [
  'https://backend-production-dfd3.up.railway.app',
  'https://backup-backend.railway.app',
  'http://localhost:4000', // Local fallback
];
```

### 3. Add Status Page

Create a status page that shows:
- Backend health
- Database health
- Last successful request
- Error rate

### 4. Upgrade Railway Plan

Free tier has limitations:
- Service sleeps after inactivity
- Limited resources
- No guaranteed uptime

Consider upgrading to:
- Hobby plan ($5/month)
- Always-on service
- Better performance

## Files Modified

1. ✅ `lib/api.ts` - Better error message parsing
2. ✅ `hooks/useJWTAuth.ts` - User-friendly error messages

## Success Criteria

✅ Backend is running on Railway
✅ Database is connected
✅ Migrations are applied
✅ Health endpoint returns "ok"
✅ Nonce endpoint works
✅ Frontend shows clear error messages
✅ Users can see what went wrong

## Next Steps

1. **Check Railway Dashboard** - Verify backend is running
2. **Restart Backend** - If needed
3. **Test Health Endpoint** - Confirm backend is alive
4. **Test Nonce Endpoint** - Confirm database works
5. **Try Login Again** - Should work now

## Contact Support

If issue persists:
1. Check Railway status page: https://status.railway.app
2. Check Railway logs for detailed errors
3. Contact Railway support if database issue
4. Share error logs for debugging

---

**Backend nonce error should be resolved after checking Railway! 🚀**
