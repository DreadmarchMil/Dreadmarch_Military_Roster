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

// 1. Startup logging - Show all environment variable values (masked)
console.log('[firebase-adapter] Module initialization - Environment variables:', {
  VITE_FIREBASE_ENABLED: import.meta.env.VITE_FIREBASE_ENABLED,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '***masked***' : 'missing',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'missing',
  VITE_FIREBASE_DATABASE_URL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'missing',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'missing',
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'missing',
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '***masked***' : 'missing',
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ? '***masked***' : 'missing',
})
console.log('[firebase-adapter] Module initialization - Computed flags:', {
  isEnabled,
  isEnvConfigured,
})

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
// 3. Fix race condition - Use promise to prevent concurrent initializations
let firebaseInitPromise: Promise<void> | null = null

async function initFirebaseIfNeeded() {
  // If already initializing, wait for that to complete
  if (firebaseInitPromise) {
    console.log('[firebase-adapter] Init already in progress, waiting...')
    return firebaseInitPromise
  }
  
  // Check if already initialized
  if ((initFirebaseIfNeeded as any)._impl) {
    console.log('[firebase-adapter] Already initialized, skipping')
    return
  }
  
  if (!isEnabled) {
    console.log('[firebase-adapter] Firebase not enabled, skipping initialization')
    return
  }

  console.log('[firebase-adapter] Starting Firebase initialization...')
  
  // Create and store the initialization promise
  firebaseInitPromise = (async () => {
    try {
      // 2. Step-by-step initialization logging
      console.log('[firebase-adapter] Step 1: Importing Firebase modules...')
      const [{ initializeApp }, { getDatabase, ref, onValue, set, get }] = await Promise.all([
        import('firebase/app'),
        import('firebase/database'),
      ])
      console.log('[firebase-adapter] Step 2: Firebase modules imported successfully')
      
      console.log('[firebase-adapter] Step 3: Initializing Firebase app with config...')
      const app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      })
      console.log('[firebase-adapter] Step 4: Firebase app initialized successfully')
      
      console.log('[firebase-adapter] Step 5: Getting database instance...')
      firebaseDb = getDatabase(app)
      console.log('[firebase-adapter] Step 6: Database instance obtained')
      
      console.log('[firebase-adapter] Step 7: Storing implementation object...')
      ;(initFirebaseIfNeeded as any)._impl = { ref, onValue, set, get, db: firebaseDb }
      
      // 5. Post-init verification logging
      const impl = (initFirebaseIfNeeded as any)._impl
      console.log('[firebase-adapter] Firebase initialization complete!', {
        implStored: !!impl,
        dbStored: !!firebaseDb,
        hasRef: !!impl?.ref,
        hasOnValue: !!impl?.onValue,
        hasSet: !!impl?.set,
        hasGet: !!impl?.get,
      })
    } catch (err) {
      // 4. Improve error capture - Log error details separately
      const error = err as Error
      console.error('[firebase-adapter] Firebase initialization failed!')
      console.error('[firebase-adapter] Error name:', error?.name || 'Unknown')
      console.error('[firebase-adapter] Error message:', error?.message || 'No message')
      if (error?.stack) {
        console.error('[firebase-adapter] Error stack:', error.stack)
      }
      
      // Debug logging: Environment variable checks
      console.error('[firebase-adapter] Debug - Required environment variables check:')
      REQUIRED_ENV.forEach(envVar => {
        const value = import.meta.env[envVar]
        const isValid = value && String(value).trim().length > 0
        console.error(`  ${envVar}: ${isValid ? '✓ present' : '✗ missing'}`)
      })
      
      // Debug logging: Environment flags
      console.error('[firebase-adapter] Debug - Environment flags:', {
        isEnabled,
        isEnvConfigured,
        VITE_FIREBASE_ENABLED: import.meta.env.VITE_FIREBASE_ENABLED,
      })
      
      console.error('[firebase-adapter] Falling back to mock mode')
    } finally {
      // Clear the promise so future calls can retry if needed
      firebaseInitPromise = null
    }
  })()
  
  return firebaseInitPromise
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
  console.log('[firebase-adapter] subscribe() called', { path, isEnabled })
  
  if (!isEnabled) {
    console.log('[firebase-adapter] Using mock implementation for subscribe', { path })
    listeners[path] = listeners[path] || new Set()
    listeners[path].add(cb)
    cb(getFromMock(path))
    return () => listeners[path].delete(cb)
  }
  await initFirebaseIfNeeded()
  const impl = (initFirebaseIfNeeded as any)._impl
  if (!impl) {
    console.log('[firebase-adapter] Firebase not initialized, falling back to mock for subscribe', { path })
    listeners[path] = listeners[path] || new Set()
    listeners[path].add(cb)
    cb(getFromMock(path))
    return () => listeners[path].delete(cb)
  }
  console.log('[firebase-adapter] Using Firebase implementation for subscribe', { path })
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
