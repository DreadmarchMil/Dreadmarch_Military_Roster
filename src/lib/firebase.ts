import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, get } from 'firebase/database'
import type { Personnel, Unit } from './types'

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

  // Get GM passkey
  getPasskey: async () => {
    const snapshot = await get(dbRefs.gmPasskey())
    return snapshot.val()
  },

  // Set GM passkey
  setPasskey: async (passkey: string) => {
    await set(dbRefs.gmPasskey(), passkey)
  },

  // Initialize default data if database is empty
  initializeDefaults: async (defaultUnits: Unit[]) => {
    const unitsSnapshot = await get(dbRefs.units())
    if (!unitsSnapshot.exists()) {
      await set(dbRefs.units(), defaultUnits)
      await set(dbRefs.currentUnitId(), defaultUnits[0].id)
      await set(dbRefs.personnelByUnit(), {})
    }
  }
}

export { database }
