# Google university login through Supabase

All application pages require Supabase Auth with a verified Google identity whose email is in `lamduan.mfu.ac.th`. The server validates the user with `getUser()` and token claims with `getClaims()`, checks OAuth authentication, confirmed email and Google identity email. Other providers and password sessions are rejected. User-editable metadata cannot grant access or roles; all accepted accounts currently receive the student role.

## Configuration

1. Put `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (and in deployment environment settings). See `.env.example`. Do not use a secret/service-role key.
2. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and enter the Google OAuth client ID and secret.
3. In Google Cloud's OAuth web client, add the Supabase callback shown in that provider panel as an authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to the actual website origin. Add `http://localhost:3000/api/auth/google/callback` to **Redirect URLs** for local development and the exact production callback URL for deployment. If using another port, add that exact URL too.
5. Restart the web server. Open the website and sign in with a university Google account. Google consent-screen testing mode may require adding that account as a test user.

The old `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` and `AUTH_URL` application variables are no longer used. Google credentials stay in the Supabase provider configuration.

## Flow and security

The server starts Supabase OAuth with PKCE, and the callback exchanges the returned code. Supabase handles the Google token verification. Domain selection via `hd` is a UI hint only; the application independently verifies the Google identity email before granting access.

Auth runs server-side with HttpOnly, SameSite=Lax cookies (Secure on HTTPS). Refreshed cookies are propagated through protected-page responses, redirects and the session endpoint. Auth responses must not be cached. Supabase manages token expiry and renewal. Logout signs out the local session and rejects cross-origin requests.

The app gate protects this website. It does not prevent unrelated accounts being created directly in the Supabase project. Before exposing real database data, add server-enforced domain rules / an Auth hook and RLS policies to Supabase; UI checks are not database authorization. No database tables are read or written by this change.

Parking, booking and notifications remain mock browser data. Existing Google subject IDs remain the keys for mock history.

## Verification

`npm test` covers accepted/rejected identity fixtures, authentication failure, refresh-cookie propagation and mock bookings. Run `npm run lint` and `npm run build`. These checks cannot replace a complete interactive Google login.

Manual acceptance: sign in with an allowed university account, verify profile email, refresh a protected page, create a mock booking, then logout and verify protected URLs redirect. A personal Gmail account must be rejected. Check production redirect URLs separately.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Google provider](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
