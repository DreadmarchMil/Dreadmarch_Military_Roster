import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Unit, Personnel } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sortUnits(units: Unit[]): Unit[] {
  // Always put unassigned at the end
  const unassigned = units.find(u => u.id === 'unassigned')
  const otherUnits = units.filter(u => u.id !== 'unassigned')
  
  // Build a map for quick parent lookup
  const unitMap = new Map(otherUnits.map(u => [u.id, u]))
  
  // Cache for memoizing path calculations
  const pathCache = new Map<string, string>()
  
  // Helper to get full path for sorting (for consistent ordering)
  const getPath = (unit: Unit): string => {
    // Check cache first
    if (pathCache.has(unit.id)) {
      return pathCache.get(unit.id)!
    }
    
    // Calculate path
    let path: string
    if (!unit.parentId) {
      path = unit.name
    } else {
      const parent = unitMap.get(unit.parentId)
      path = parent ? `${getPath(parent)}/${unit.name}` : unit.name
    }
    
    // Store in cache
    pathCache.set(unit.id, path)
    return path
  }
  
  // Sort by sortOrder if present, then by path
  const sorted = otherUnits.sort((a, b) => {
    // If both have sortOrder, use that
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder
    }
    
    // If only one has sortOrder, it comes first
    if (a.sortOrder !== undefined) return -1
    if (b.sortOrder !== undefined) return 1
    
    // Otherwise sort by path (alphabetical with hierarchy)
    const pathA = getPath(a)
    const pathB = getPath(b)
    return pathA.localeCompare(pathB)
  })
  
  // Add unassigned at the end if it exists
  return unassigned ? [...sorted, unassigned] : sorted
}

export function sortPersonnelByRank(personnel: Personnel[]): Personnel[] {
  return [...personnel].sort((a, b) => {
    const gradeA = parseInt(a.grade) || 0
    const gradeB = parseInt(b.grade) || 0
    
    return gradeB - gradeA || a.name.localeCompare(b.name)
  })
}
