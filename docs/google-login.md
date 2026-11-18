# Google university login

All application pages require a server-verified Google session. Only verified Google Workspace accounts with email domain and hosted-domain claim `lamduan.mfu.ac.th` are accepted. Personal Gmail and other university domains are rejected. Google login is real; parking, booking and notifications remain simulated browser data. New users currently receive the student role; REG-derived roles are a future integration.

## Setup

1. In Google Cloud Console, configure Google Auth Platform / OAuth consent screen and create an OAuth client of type **Web application**. Request only `openid email profile`. If the app is in testing mode, add the intended university test users. University Google Workspace administrators may need to allow the application.
2. Add the exact authorized redirect URI: `http://localhost:3000/api/auth/google/callback` for local development, or `https://YOUR-DOMAIN/api/auth/google/callback` for deployment. Use the actual local port if different.
3. Add server-only environment values to `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_URL` (the website origin), and `AUTH_SECRET` (a cryptographically random secret of at least 32 characters). Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never commit or share the secret. See `.env.example` for variable names.
4. Restart the server. Production must use HTTPS. Open the website in a private window and sign in using an approved university account.

Without configuration, the login page remains accessible and its login button is disabled; protected pages stay inaccessible. No demo-account or email-text-field bypass is provided.

## Security and verification

The server checks signed OAuth state, PKCE, nonce, Google ID-token signature, issuer, audience, expiry, verified email and hosted domain. Sessions use signed, eight-hour HttpOnly SameSite=Lax cookies (Secure on HTTPS). Logout clears the session and checks request origin. Authentication endpoints return no-store responses. The Google domain-selection hint alone does not grant access.

`npm test` uses locally signed fixtures to test signature rejection, university restrictions, token expiry and configuration. It does not prove a live Google Cloud client is correctly configured. After setup, verify an allowed account succeeds, a personal Gmail account fails, direct protected URLs redirect to login, and logout removes access.

Mock booking storage is not authoritative authorization or a production database. Future booking APIs must verify the server session and ownership independently.

Reference: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).
