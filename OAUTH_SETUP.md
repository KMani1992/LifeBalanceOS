# OAuth Callback Setup Guide

## Overview
OAuth now redirects directly to the home page (`/`) after authentication. The auth context automatically establishes the session from the OAuth tokens.

## Redirect URL Configuration

**This is the most common cause of OAuth issues - the redirect URL must match EXACTLY in Supabase and Google Cloud Console.**

### Step 1: Supabase Configuration

In your **Supabase Dashboard**:
1. Go to **Authentication** → **Providers** → **Google**
2. Under **Redirect URLs**, add:
   - **Development (local)**: `http://localhost:3000/`
   - **Production**: `https://life-balance-os-six.vercel.app/`

⚠️ **Important**: The URL must be EXACT (including trailing slash, http/https, domain)

### Step 2: Google Cloud Console Configuration

In **Google Cloud Console**:
1. Go to **APIs & Services** → **OAuth 2.0 Client IDs**
2. Edit your LifeBalanceOS client
3. Under **Authorized redirect URIs**, add ALL of these:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   http://localhost:3000/
   https://life-balance-os-six.vercel.app/
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
# You should be redirected directly to home page
# Session establishes automatically
```

### Production Testing (Vercel)
```bash
# After pushing to GitHub, verify it deployed to Vercel
# Visit https://life-balance-os-six.vercel.app
# Click "Sign in with Google"
# Should redirect to home page after OAuth
```

## How It Works

1. **User initiates sign-in**
   - Clicks "Sign in with Google" button
   - `signInWithGoogle()` initiates OAuth flow

2. **Google OAuth flow**
   - User authenticates with Google
   - Google redirects back to home page (`/`) with tokens in URL hash

3. **Home page handles session**
   - Middleware detects OAuth tokens in cookies (set by Supabase)
   - Auth context reads and establishes session
   - User data loads into Redux state

4. **Smooth navigation**
   - Page displays home content
   - User can navigate to other pages

## Troubleshooting

### ❌ Getting "Invalid request" error
**Cause**: Redirect URL doesn't match exactly in Supabase or Google Cloud Console
- Verify redirect URL matches EXACTLY (including `http://` vs `https://`, domain, trailing slash)
- Check for typos in domain name
- Clear browser cookies and cache
- Try in incognito/private mode

**Fix**: 
1. Compare your URLs character-by-character
2. If you fixed the URL, test again
3. If still broken, regenerate Google OAuth credentials

### ❌ Stuck on login page after clicking "Sign in with Google"
**Cause**: OAuth redirect URL not configured properly
- Check that redirect URL is set in Supabase (Step 1 above)
- Check that URL is added to Google Cloud Console (Step 2 above)

**Fix**: 
1. Double-check both Supabase and Google Cloud URLs match
2. Ensure trailing slashes are consistent
3. Clear cookies and try again

### ❌ Works locally but not on production (Vercel)
**Cause**: Production redirect URL not configured
- Supabase redirect URL doesn't include the Vercel domain
- Google Cloud Console missing Vercel domain

**Fix**:
1. Add `https://life-balance-os-six.vercel.app/` to Supabase redirect URLs
2. Add `https://life-balance-os-six.vercel.app/` to Google Cloud Console redirect URIs
3. Deploy again or wait for Vercel to sync

## Debugging Helper: Test Supabase Connection

```bash
# Test if Supabase is reachable
curl https://ptmllkgovvwszeppmhhjc.supabase.co/rest/v1/

# Should return: {"message":"Unauthorized"}
# If you get a timeout or "not found", your SUPABASE_URL is wrong
```

## Files Involved

- **OAuth Function**: [src/lib/persistence.ts](../src/lib/persistence.ts#L278) - `signInWithGoogle()`
- **Auth Provider**: [src/lib/auth-context.tsx](../src/lib/auth-context.tsx)
- **Sign-in Form**: [src/components/auth/AuthGate.tsx](../src/components/auth/AuthGate.tsx#L106)

## More Help

If issues persist after checking the above:
1. Check Supabase project browser tab (Authentication → Users) - is the user created?
2. Look at Vercel logs: Dashboard → Your Project → Deployments → Logs
3. Check browser Network tab (F12) when clicking "Sign in" - what URL is it redirecting to?
