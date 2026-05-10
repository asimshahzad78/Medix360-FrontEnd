import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const read = (path) => readFileSync(join(root, path), 'utf8')

const checks = []
const assert = (name, condition) => {
  checks.push({ name, passed: Boolean(condition) })
}

const authSession = read('src/security/auth-session.ts')
const frontendHardening = read('src/security/frontend-hardening.ts')
const main = read('src/main.ts')
const api = read('src/services/api.ts')
const env = read('.env')

assert('auth token storage defaults to session mode', frontendHardening.includes("return 'session'"))
assert('production build rejects local token storage', frontendHardening.includes("authTokenStorageMode === 'local'"))
assert('production API origin must be HTTPS outside localhost', frontendHardening.includes('VITE_API_ORIGIN must use HTTPS outside localhost'))
assert('frontend hardening config is checked before app bootstrap', main.includes('assertFrontendSecurityConfig()'))
assert('environment opts into session token storage', env.includes('VITE_AUTH_TOKEN_STORAGE=session'))
assert('auth persistence uses storage abstraction', authSession.includes('const authStorage = (): Storage | null'))
assert('auth persistence clears fallback storage during writes', authSession.includes('fallbackStorage().removeItem(key)'))
assert('auth persistence no longer writes token directly to localStorage', !authSession.includes('localStorage.setItem(TOKEN_KEY'))
assert('api requests include correlation IDs', api.includes("config.headers['X-Correlation-ID']"))
assert('idempotency header is supported for sensitive mutations', api.includes("config.headers['Idempotency-Key']"))

const failed = checks.filter((check) => !check.passed)

for (const check of checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}`)
}

if (failed.length > 0) {
  console.error(`\nSecurity smoke test failed: ${failed.length} check(s) failed.`)
  process.exit(1)
}

console.log(`\nSecurity smoke test passed: ${checks.length} checks.`)
