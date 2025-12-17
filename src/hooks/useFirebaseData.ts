import { useEffect, useState } from 'react'
import { firebaseHelpers } from '@/lib/firebase'
import type { Personnel, Unit } from '@/lib/types'

export function useFirebasePersonnel() {
  const [personnelByUnit, setPersonnelByUnit] = useState<Record<string, Personnel[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout fallback - don't hang forever
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)

    const unsubscribe = firebaseHelpers.subscribeToPersonnel((data) => {
      setPersonnelByUnit(data)
      setLoading(false)
      clearTimeout(timeout)
    })

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const updatePersonnel = async (data: Record<string, Personnel[]>) => {
    try {
      await firebaseHelpers.updatePersonnel(data)
    } catch (error) {
      console.error('Failed to update personnel:', error)
      throw error
    }
  }

  return { personnelByUnit, updatePersonnel, loading }
}

export function useFirebaseUnits(defaultUnits: Unit[]) {
  const [units, setUnits] = useState<Unit[]>(defaultUnits)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize defaults if needed
    firebaseHelpers.initializeDefaults(defaultUnits)

    // Timeout fallback - don't hang forever
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)

    const unsubscribe = firebaseHelpers.subscribeToUnits((data) => {
      setUnits(data.length > 0 ? data : defaultUnits)
      setLoading(false)
      clearTimeout(timeout)
    })

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [defaultUnits])

  const updateUnits = async (data: Unit[]) => {
    try {
      await firebaseHelpers.updateUnits(data)
    } catch (error) {
      console.error('Failed to update units:', error)
      throw error
    }
  }

  return { units, updateUnits, loading }
}

export function useFirebaseCurrentUnit(defaultUnitId: string) {
  const [currentUnitId, setCurrentUnitIdState] = useState<string>(defaultUnitId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout fallback - don't hang forever
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)

    const unsubscribe = firebaseHelpers.subscribeToCurrentUnitId((unitId) => {
      setCurrentUnitIdState(unitId || defaultUnitId)
      setLoading(false)
      clearTimeout(timeout)
    }, defaultUnitId)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [defaultUnitId])

  const setCurrentUnitId = async (unitId: string) => {
    setCurrentUnitIdState(unitId)
    try {
      await firebaseHelpers.updateCurrentUnitId(unitId)
    } catch (error) {
      console.error('Failed to update current unit ID:', error)
      throw error
    }
  }

  return { currentUnitId, setCurrentUnitId, loading }
}
