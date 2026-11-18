import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { NextRequest, NextResponse } from 'next/server.js';

function load(file, modules = {}, env = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { process: { env }, URL, AbortSignal, fetch })(name => modules[name], mod, mod.exports);
  return mod.exports;
}
const policy = load('lib/auth/policy.ts');
const identity = { provider: 'google', identity_data: { sub: 'google-sub', email: 'student@lamduan.mfu.ac.th', email_verified: true, full_name: 'Student' } };
const user = { id: 'supabase-id', email: identity.identity_data.email, email_confirmed_at: '2026-11-18T00:00:00Z', app_metadata: { provider: 'google' }, identities: [identity], user_metadata: { role: 'admin' } };
const claims = { sub: user.id, amr: [{ method: 'oauth' }] };

test('verified Google university identity maps to student and stable mock history key', () => {
  const result = policy.universityUser(user, claims);
  assert.equal(result.id, 'google:google-sub');
  assert.equal(result.role, 'student');
  assert.equal(result.email, user.email);
});

test('reject personal/suffix emails, unverified identities, other providers and forged metadata', () => {
  for (const change of [
    { email: 'student@gmail.com' }, { email: 'student@lamduan.mfu.ac.th.evil.com' },
    { email_confirmed_at: null }, { identities: [] },
    { app_metadata: { provider: 'email' } },
    { identities: [{ ...identity, provider: 'github' }] },
    { identities: [identity, { provider: 'github' }] },
    ...[{ email_verified: false }, { email_verified: 'true' }, { email: 'another@lamduan.mfu.ac.th' }, { sub: '' }].map(data => ({ identities: [{ ...identity, identity_data: { ...identity.identity_data, ...data } }] })),
  ]) assert.equal(policy.universityUser({ ...user, ...change }, claims), null);
  for (const invalid of [{ ...claims, sub: 'other' }, { ...claims, amr: [{ method: 'password' }] }, { sub: user.id }]) assert.equal(policy.universityUser(user, invalid), null);
});

function serverHarness({ authError = null, claimsError = null } = {}, env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-public-key' }) {
  let options;
  let claimCalls = 0;
  const server = load('lib/auth/server.ts', {
    './policy': policy, 'next/server': { NextRequest, NextResponse },
    '@supabase/ssr': { createServerClient(_url, _key, supplied) {
      options = supplied;
      return { auth: {
        async getUser() {
          options.cookies.setAll([{ name: 'sb-test-auth-token', value: 'refreshed', options: { httpOnly: true, path: '/' } }]);
          return { data: { user: authError ? null : user }, error: authError };
        },
        async getClaims() { claimCalls++; return { data: { claims }, error: claimsError }; },
      } };
    } },
  }, env);
  return { server, calls: () => claimCalls };
}
test('server-verified user and refresh cookies survive redirects with no-cache headers', async () => {
  const { server } = serverHarness();
  const request = new NextRequest('https://parking.example/my-booking');
  const auth = server.requestAuth(request);
  assert.equal((await auth.user()).id, 'google:google-sub');
  assert.equal(request.cookies.get('sb-test-auth-token').value, 'refreshed');
  const response = auth.finish(NextResponse.redirect('https://parking.example/'));
  assert.equal(response.cookies.get('sb-test-auth-token').value, 'refreshed');
  assert.match(response.headers.get('cache-control'), /no-store/);
});
test('Auth errors fail closed; missing configuration does not enable login', async () => {
  const denied = serverHarness({ authError: new Error('invalid token') });
  assert.equal(await denied.server.requestAuth(new NextRequest('https://parking.example')).user(), null);
  assert.equal(denied.calls(), 0);
  const badClaims = serverHarness({ claimsError: new Error('bad signature') });
  assert.equal(await badClaims.server.requestAuth(new NextRequest('https://parking.example')).user(), null);
  assert.equal(serverHarness({}, {}).server.isAuthConfigured(), false);
  assert.equal(serverHarness().server.isAuthConfigured(), true);
});
