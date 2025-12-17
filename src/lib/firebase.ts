import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, get } from 'firebase/database'
import type { Personnel, Unit } from './types'
import { hashValue, verifyHash } from './hash'

// Firebase configuration - these will be set via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validate Firebase configuration
const requiredEnvVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_DATABASE_URL', 'VITE_FIREBASE_PROJECT_ID']
const missingVars = requiredEnvVars.filter(key => !import.meta.env[key])
if (missingVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingVars)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Database references
export const dbRefs = {
  personnelByUnit: () => ref(database, 'personnelByUnit'),
  units: () => ref(database, 'units'),
  currentUnitId: () => ref(database, 'currentUnitId'),
  gmPasskey: () => ref(database, 'gmPasskey')
}

// Helper functions for Firebase operations
export const firebaseHelpers = {
  // Subscribe to personnel data changes
  subscribeToPersonnel: (callback: (data: Record<string, Personnel[]>) => void) => {
    return onValue(dbRefs.personnelByUnit(), (snapshot) => {
      const data = snapshot.val() || {}
      callback(data)
    })
  },

  // Subscribe to units data changes
  subscribeToUnits: (callback: (data: Unit[]) => void) => {
    return onValue(dbRefs.units(), (snapshot) => {
      const data = snapshot.val() || []
      callback(data)
    })
  },

  // Subscribe to current unit ID changes
  subscribeToCurrentUnitId: (callback: (unitId: string) => void) => {
    return onValue(dbRefs.currentUnitId(), (snapshot) => {
      const data = snapshot.val()
      if (data) callback(data)
    })
  },

  // Update personnel data
  updatePersonnel: async (data: Record<string, Personnel[]>) => {
    await set(dbRefs.personnelByUnit(), data)
  },

  // Update units data
  updateUnits: async (data: Unit[]) => {
    await set(dbRefs.units(), data)
  },

  // Update current unit ID
  updateCurrentUnitId: async (unitId: string) => {
    await set(dbRefs.currentUnitId(), unitId)
  },

  // Get GM passkey (returns hashed value)
  getPasskey: async () => {
    const snapshot = await get(dbRefs.gmPasskey())
    return snapshot.val()
  },

  // Set GM passkey (stores hashed value)
  setPasskey: async (passkey: string) => {
    const hashedPasskey = await hashValue(passkey)
    await set(dbRefs.gmPasskey(), hashedPasskey)
  },

  // Verify passkey without exposing the hash
  verifyPasskey: async (inputPasskey: string): Promise<boolean> => {
    const storedHash = await get(dbRefs.gmPasskey())
    const storedValue = storedHash.val()
    
    if (!storedValue) {
      // No passkey set yet - this is first-time setup
      return false
    }
    
    return await verifyHash(inputPasskey, storedValue)
  },

  // Check if stored passkey needs migration from plain text to hash
  migratePasskeyIfNeeded: async (plainTextPasskey: string): Promise<void> => {
    const storedValue = await get(dbRefs.gmPasskey())
    const stored = storedValue.val()
    
    // If there's a stored value and it's not a valid SHA-256 hex hash (64 hex chars)
    const isValidHash = stored && /^[a-f0-9]{64}$/i.test(stored)
    if (stored && !isValidHash) {
      console.log('Migrating passkey to hashed format...')
      // Re-hash and store
      const hashedPasskey = await hashValue(plainTextPasskey)
      await set(dbRefs.gmPasskey(), hashedPasskey)
      console.log('Passkey migration complete')
    }
  },

  // Initialize default data if database is empty
  initializeDefaults: async (defaultUnits: Unit[]) => {
    if (!defaultUnits || defaultUnits.length === 0) {
      console.error('Cannot initialize Firebase: defaultUnits is empty')
      return
    }
    try {
      const unitsSnapshot = await get(dbRefs.units())
      if (!unitsSnapshot.exists()) {
        await set(dbRefs.units(), defaultUnits)
        await set(dbRefs.currentUnitId(), defaultUnits[0].id)
        await set(dbRefs.personnelByUnit(), {})
      }
    } catch (error) {
      console.error('Failed to initialize Firebase defaults:', error)
    }
  }
}

export { database }
