// Adapter that abstracts Firebase. When VITE_FIREBASE_ENABLED !== 'true' or required env is missing,
// the adapter falls back to a safe in-memory + localStorage mock. This prevents accidental writes
// to production Firebase when editing in automated environments like Spark.

type Listener = (value: any) => void

const REQUIRED_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
]

const isEnvConfigured = REQUIRED_ENV.every(k => Boolean(import.meta.env[k]))
export const isEnabled = import.meta.env.VITE_FIREBASE_ENABLED === 'true' && isEnvConfigured

// ---------- Mock store implementation ----------
const mockStore: Record<string, any> = {}
const listeners: Record<string, Set<Listener>> = {}

function notifyListeners(path: string) {
  const val = getFromMock(path)
  const setOfListeners = listeners[path]
  if (setOfListeners) setOfListeners.forEach(l => l(val))
}

function getFromMock(path: string) {
  const parts = path.split('/').filter(Boolean)
  let cur: any = mockStore
  for (const p of parts) {
    if (cur == null) return null
    cur = cur[p]
  }
  return cur ?? null
}

function setInMock(path: string, value: any) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return
  let cur: any = mockStore
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    if (!cur[p]) cur[p] = {}
    cur = cur[p]
  }
  cur[parts[parts.length - 1]] = value
  try { 
    localStorage.setItem('__firebase_adapter_mock__', JSON.stringify(mockStore)) 
  } catch {
    // Best-effort localStorage persistence; silent fail on storage errors
  }
  notifyListeners(path)
}

// Restore from localStorage on init (best-effort)
try {
  const raw = localStorage.getItem('__firebase_adapter_mock__')
  if (raw) Object.assign(mockStore, JSON.parse(raw))
} catch {
  // Best-effort localStorage restore; silent fail on parse errors
}

// ---------- Firebase lazy init (only when enabled) ----------
let firebaseDb: any = null
let firebaseInitialized = false

async function initFirebaseIfNeeded() {
  if (firebaseInitialized || !isEnabled) return
  firebaseInitialized = true
  try {
    const [{ initializeApp }, { getDatabase, ref, onValue, set, get }] = await Promise.all([
      import('firebase/app'),
      import('firebase/database'),
    ])
    const app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
    firebaseDb = getDatabase(app)
    ;(initFirebaseIfNeeded as any)._impl = { ref, onValue, set, get, db: firebaseDb }
} catch (err) {
  console.error('[firebase-adapter] Firebase init failed, falling back to mock', err)
  
  // Debug logging: Environment variable checks
  console.error('[firebase-adapter] Debug - Required environment variables check:')
  REQUIRED_ENV.forEach(envVar => {
    const value = import.meta.env[envVar]
    console.error(`  ${envVar}: ${value ? '✓ present' : '✗ missing'}`)
  })
  
  // Debug logging: Environment flags
  console.error('[firebase-adapter] Debug - Environment flags:', {
    isEnabled,
    isEnvConfigured,
    VITE_FIREBASE_ENABLED: import.meta.env.VITE_FIREBASE_ENABLED,
  })
  
  // Debug logging: Firebase config (mask sensitive values)
  console.error('[firebase-adapter] Debug - Firebase config used:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '***masked***' : 'missing',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'missing',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'missing',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'missing',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '***masked***' : 'missing',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '***masked***' : 'missing',
  })
  }
}

// ---------- Public adapter API ----------
export async function read(path: string): Promise<any> {
  if (!isEnabled) return Promise.resolve(getFromMock(path))
  await initFirebaseIfNeeded()
  const impl = (initFirebaseIfNeeded as any)._impl
  if (!impl) return getFromMock(path)
  const snapshot = await impl.get(impl.ref(impl.db, path))
  return snapshot.val()
}

export async function write(path: string, value: any): Promise<void> {
  if (!isEnabled) { setInMock(path, value); return }
  await initFirebaseIfNeeded()
  const impl = (initFirebaseIfNeeded as any)._impl
  if (!impl) { setInMock(path, value); return }
  await impl.set(impl.ref(impl.db, path), value)
}

export async function subscribe(path: string, cb: (value: any) => void): Promise<() => void> {
  if (!isEnabled) {
    listeners[path] = listeners[path] || new Set()
    listeners[path].add(cb)
    cb(getFromMock(path))
    return () => listeners[path].delete(cb)
  }
  await initFirebaseIfNeeded()
  const impl = (initFirebaseIfNeeded as any)._impl
  if (!impl) {
    listeners[path] = listeners[path] || new Set()
    listeners[path].add(cb)
    cb(getFromMock(path))
    return () => listeners[path].delete(cb)
  }
  const dbRef = impl.ref(impl.db, path)
  const handler = (snap: any) => cb(snap.val())
  const unsubscribe = impl.onValue(dbRef, handler)
  // Return the Firebase unsubscribe function
  return unsubscribe
}

export function clearMock() {
  Object.keys(mockStore).forEach(k => delete (mockStore as any)[k])
  try { 
    localStorage.removeItem('__firebase_adapter_mock__') 
  } catch {
    // Best-effort cleanup; silent fail on storage errors
  }
}
