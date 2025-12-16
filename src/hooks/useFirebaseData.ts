import { useEffect, useState } from 'react'
import { firebaseHelpers } from '@/lib/firebase'
import type { Personnel, Unit } from '@/lib/types'

export function useFirebasePersonnel() {
  const [personnelByUnit, setPersonnelByUnit] = useState<Record<string, Personnel[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = firebaseHelpers.subscribeToPersonnel((data) => {
      setPersonnelByUnit(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updatePersonnel = async (data: Record<string, Personnel[]>) => {
    await firebaseHelpers.updatePersonnel(data)
  }

  return { personnelByUnit, updatePersonnel, loading }
}

export function useFirebaseUnits(defaultUnits: Unit[]) {
  const [units, setUnits] = useState<Unit[]>(defaultUnits)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize defaults if needed
    firebaseHelpers.initializeDefaults(defaultUnits)

    const unsubscribe = firebaseHelpers.subscribeToUnits((data) => {
      setUnits(data.length > 0 ? data : defaultUnits)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateUnits = async (data: Unit[]) => {
    await firebaseHelpers.updateUnits(data)
  }

  return { units, updateUnits, loading }
}

export function useFirebaseCurrentUnit(defaultUnitId: string) {
  const [currentUnitId, setCurrentUnitIdState] = useState<string>(defaultUnitId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = firebaseHelpers.subscribeToCurrentUnitId((unitId) => {
      setCurrentUnitIdState(unitId)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const setCurrentUnitId = async (unitId: string) => {
    setCurrentUnitIdState(unitId)
    await firebaseHelpers.updateCurrentUnitId(unitId)
  }

  return { currentUnitId, setCurrentUnitId, loading }
}
