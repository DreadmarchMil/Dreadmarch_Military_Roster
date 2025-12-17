import { read, write, subscribe } from './firebase-adapter'
import type { Personnel, Unit } from './types'
import { hashValue, verifyHash } from './hash'

// dbRefs kept for compatibility; in mock mode they are plain path strings
export const dbRefs = {
  personnelByUnit: () => 'personnelByUnit',
  units: () => 'units',
  currentUnitId: () => 'currentUnitId',
  gmPasskey: () => 'gmPasskey'
}

export const firebaseHelpers = {
  subscribeToPersonnel: (callback: (data: Record<string, Personnel[]>) => void) => {
    let unsub: (() => void) | null = null
    let cancelled = false
    subscribe(dbRefs.personnelByUnit(), (val) => callback(val || {})).then(fn => { 
      if (!cancelled) unsub = fn 
    })
    return () => { 
      cancelled = true
      if (unsub) unsub() 
    }
  },

  subscribeToUnits: (callback: (data: Unit[]) => void) => {
    let unsub: (() => void) | null = null
    let cancelled = false
    subscribe(dbRefs.units(), (val) => callback((val && Array.isArray(val)) ? val : [])).then(fn => { 
      if (!cancelled) unsub = fn 
    })
    return () => { 
      cancelled = true
      if (unsub) unsub() 
    }
  },

  subscribeToCurrentUnitId: (callback: (unitId: string) => void) => {
    let unsub: (() => void) | null = null
    let cancelled = false
    subscribe(dbRefs.currentUnitId(), (val) => { if (val) callback(val) }).then(fn => { 
      if (!cancelled) unsub = fn 
    })
    return () => { 
      cancelled = true
      if (unsub) unsub() 
    }
  },

  updatePersonnel: async (data: Record<string, Personnel[]>) => {
    await write(dbRefs.personnelByUnit(), data)
  },

  updateUnits: async (data: Unit[]) => {
    await write(dbRefs.units(), data)
  },

  updateCurrentUnitId: async (unitId: string) => {
    await write(dbRefs.currentUnitId(), unitId)
  },

  getPasskey: async () => {
    return await read(dbRefs.gmPasskey())
  },

  setPasskey: async (passkey: string) => {
    const hashed = await hashValue(passkey)
    await write(dbRefs.gmPasskey(), hashed)
  },

  verifyPasskey: async (inputPasskey: string): Promise<boolean> => {
    const stored = await read(dbRefs.gmPasskey())
    if (!stored) return false
    return await verifyHash(inputPasskey, stored)
  },

  migratePasskeyIfNeeded: async (plainTextPasskey: string): Promise<void> => {
    const stored = await read(dbRefs.gmPasskey())
    const isValidHash = stored && /^[a-f0-9]{64}$/.test(stored)
    if (stored && !isValidHash) {
      const hashedPasskey = await hashValue(plainTextPasskey)
      await write(dbRefs.gmPasskey(), hashedPasskey)
    }
  },

  initializeDefaults: async (defaultUnits: Unit[]) => {
    const existingUnits = await read(dbRefs.units())
    if (!existingUnits || (Array.isArray(existingUnits) && existingUnits.length === 0)) {
      await write(dbRefs.units(), defaultUnits)
      await write(dbRefs.currentUnitId(), defaultUnits[0].id)
      await write(dbRefs.personnelByUnit(), {})
    }
  }
}

// Export a placeholder database object for compatibility. When adapter is enabled this remains undefined.
export const database: undefined = undefined
