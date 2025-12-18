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
  
  // Helper to get full path for sorting (for consistent ordering)
  const getPath = (unit: Unit): string => {
    if (!unit.parentId) return unit.name
    const parent = unitMap.get(unit.parentId)
    return parent ? `${getPath(parent)}/${unit.name}` : unit.name
  }
  
  // Sort by path (this ensures parents come before children and alphabetical order)
  const sorted = otherUnits.sort((a, b) => {
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
