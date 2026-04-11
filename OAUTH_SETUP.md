# OAuth Callback Setup Guide

## Overview
The OAuth callback flow redirects users back to `/auth/callback` after they authenticate with Google. This page handles the session initialization and redirects to the dashboard on success.

## Redirect URL Configuration

**This is the most common cause of OAuth issues - the redirect URL must match EXACTLY in Supabase and Google Cloud Console.**

### Step 1: Supabase Configuration

In your **Supabase Dashboard**:
1. Go to **Authentication** → **Providers** → **Google**
2. Under **Redirect URLs**, add:
   - **Development (local)**: `http://localhost:3000/auth/callback`
   - **Production**: `https://life-balance-os-six.vercel.app/auth/callback`

⚠️ **Important**: The URL must be EXACT (http/https, domain, path all matter)

### Step 2: Google Cloud Console Configuration

In **Google Cloud Console**:
1. Go to **APIs & Services** → **OAuth 2.0 Client IDs**
2. Edit your LifeBalanceOS client
3. Under **Authorized redirect URIs**, add ALL of these:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://life-balance-os-six.vercel.app/auth/callback
   ```
   
   (Replace `your-supabase-project` with your actual Supabase project name)

4. Click **Save**

### Step 3: Verify Environment Variables

Check your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ptmllkgovvwszeppmhhjc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

## Testing the Flow

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# If not logged in, you'll see the AuthGate sign-in form
# Click "Sign in with Google"
# You should land on /auth/callback (loading state)
# After 2-4 seconds, redirects to /dashboard
```

### Production Testing (Vercel)
```bash
# After pushing to GitHub, verify it deployed to Vercel
# Visit https://life-balance-os-six.vercel.app
# Click "Sign in with Google"
# Should redirect to /dashboard after 2-4 seconds
```

## How It Works

1. **User initiates sign-in**
   - Clicks "Sign in with Google" button
   - `signInWithGoogle()` initiates OAuth flow

2. **Google OAuth flow**
   - User authenticates with Google
   - Google redirects back to `/auth/callback` with tokens in URL hash

3. **Callback page processes**
   - Page loads and checks URL for tokens
   - Waits for AuthContext to establish session (reads cookies)
   - Shows loading spinner during this time

4. **Success redirect**
   - AuthContext detects authenticated user
   - Redirects to `/dashboard`

## Troubleshooting

### ❌ Getting "Invalid request" error
**Cause**: No authentication tokens found
- Verify redirect URL matches EXACTLY in both Supabase and Google Cloud Console
- Check for typos (http vs https, domain spelling, path)
- Clear browser cookies and cache
- Try in incognito/private mode

**Fix**: 
1. Compare your URLs character-by-character
2. If you fixed the URL, test again
3. If still broken, regenerate Google OAuth credentials

### ❌ Stuck on /auth/callback loading screen
**Cause**: Session not being established from tokens
- Check browser console for errors (F12 → Console tab)
- Verify NEXT_PUBLIC_SUPABASE_URL is correct in .env.local
- Check that NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is valid

**Fix**: 
1. Open browser DevTools (F12)
2. Check Console tab for error messages
3. If error mentions "Supabase", verify environment variables
4. If no errors but stuck loading, wait 10 seconds (network delay possible)

### ❌ Redirect back to /auth?error=X
**Cause**: Authentication succeeded but session initialization failed
- Could be auth context not loading properly
- Could be network issue

**Fix**:
1. Check browser console for errors
2. Try signing in again (page might be in error state)
3. If persists, check server logs in Vercel dashboard
4. Verify Supabase project is working (test with curl command below)

### ❌ Works locally but not on Vercel
**Cause**: Redirect URL not configured for Vercel domain
- Local has `http://localhost:3000`
- But Vercel uses `https://life-balance-os-six.vercel.app`

**Fix**:
1. Add Vercel redirect URL to Supabase:
   ```
   https://life-balance-os-six.vercel.app/auth/callback
   ```
2. Add to Google Cloud Console:
   ```
   https://life-balance-os-six.vercel.app/auth/callback
   ```
3. Deploy again or wait for Vercel to sync env vars

## Debugging Helper: Test Supabase Connection

```bash
# Test if Supabase is reachable
curl https://ptmllkgovvwszeppmhhjc.supabase.co/rest/v1/

# Should return: {"message":"Unauthorized"}
# If you get a timeout or "not found", your SUPABASE_URL is wrong
```

## Files Involved

- **Callback Page**: [src/app/auth/callback/page.tsx](../src/app/auth/callback/page.tsx)
- **OAuth Function**: [src/lib/persistence.ts](../src/lib/persistence.ts#L278) - `signInWithGoogle()`
- **Auth Provider**: [src/lib/auth-context.tsx](../src/lib/auth-context.tsx)
- **Sign-in Form**: [src/components/auth/AuthGate.tsx](../src/components/auth/AuthGate.tsx#L106)

## More Help

If issues persist after checking the above:
1. Check Supabase project browser tab (Authentication → Users) - is the user created?
2. Look at Vercel logs: Dashboard → Your Project → Deployments → Logs
3. Check browser Network tab (F12) when clicking "Sign in" - what URL is it redirecting to?
