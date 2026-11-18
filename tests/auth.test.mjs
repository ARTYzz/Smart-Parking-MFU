import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jose from 'jose';

const keys = await jose.generateKeyPair('RS256');
const jwk = await jose.exportJWK(keys.publicKey);
function harness(overrides = {}) {
  const env = { AUTH_SECRET: 'test-only-secret-at-least-32-characters', AUTH_URL: 'http://localhost:3102', GOOGLE_CLIENT_ID: 'test-client', GOOGLE_CLIENT_SECRET: 'test-secret', ...overrides };
  function load(file) {
    const mod = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const requireLocal = name => name === 'jose' ? { ...jose, createRemoteJWKSet: () => jose.createLocalJWKSet({ keys: [jwk] }) } : load('lib/auth/policy.ts');
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { process: { env }, TextEncoder, URL })(requireLocal, mod, mod.exports);
    return mod.exports;
  }
  return load('lib/auth/server.ts');
}
const user = { sub: 'google:123', name: 'Student', email: 'student@lamduan.mfu.ac.th', role: 'student' };

test('sessions reject tampering, expiry, flow tokens and unauthorized identities', async () => {
  const auth = harness();
  const token = await auth.signAuthToken(user, 'session', 60);
  assert.equal((await auth.sessionUser(token)).email, user.email);
  assert.equal(await auth.sessionUser(token + 'broken'), null);
  assert.equal(await auth.sessionUser(), null);
  for (const [payload, kind, lifetime] of [[user, 'session', -1], [user, 'flow', 60], [{ ...user, email: 'student@gmail.com' }, 'session', 60], [{ ...user, role: 'admin' }, 'session', 60]]) {
    assert.equal(await auth.sessionUser(await auth.signAuthToken(payload, kind, lifetime)), null);
  }
});

test('configuration fails closed without secrets or with insecure public origins', () => {
  assert.equal(harness().isAuthConfigured(), true);
  for (const env of [{ AUTH_SECRET: '' }, { GOOGLE_CLIENT_ID: '' }, { GOOGLE_CLIENT_SECRET: '' }, { AUTH_URL: 'http://example.com' }]) assert.equal(harness(env).isAuthConfigured(), false);
});

test('Google tokens require valid signature, audience, issuer, nonce and verified university domain', async () => {
  const auth = harness();
  const claims = { sub: '123', email: user.email, email_verified: true, hd: 'lamduan.mfu.ac.th', nonce: 'expected', name: 'Student' };
  async function token(extra = {}, signingKey = keys.privateKey) {
    return new jose.SignJWT({ ...claims, ...extra }).setProtectedHeader({ alg: 'RS256' }).setIssuer('https://accounts.google.com').setAudience('test-client').setExpirationTime('5m').sign(signingKey);
  }
  assert.equal((await auth.verifyGoogleToken(await token(), 'test-client', 'expected')).id, 'google:123');
  for (const extra of [{ email: 'student@gmail.com' }, { email: 'student@lamduan.mfu.ac.th.evil.com' }, { email_verified: false }, { email_verified: 'true' }, { hd: 'mfu.ac.th' }, { hd: undefined }, { nonce: 'other' }]) {
    await assert.rejects(() => token(extra).then(value => auth.verifyGoogleToken(value, 'test-client', 'expected')));
  }
  await assert.rejects(() => token().then(value => auth.verifyGoogleToken(value, 'wrong-client', 'expected')));
  const otherKeys = await jose.generateKeyPair('RS256');
  await assert.rejects(() => token({}, otherKeys.privateKey).then(value => auth.verifyGoogleToken(value, 'test-client', 'expected')));
  for (const [issuer, expiry] of [['https://evil.com', '5m'], ['https://accounts.google.com', '-1s']]) {
    const value = await new jose.SignJWT(claims).setProtectedHeader({ alg: 'RS256' }).setIssuer(issuer).setAudience('test-client').setExpirationTime(expiry).sign(keys.privateKey);
    await assert.rejects(() => auth.verifyGoogleToken(value, 'test-client', 'expected'));
  }
});
