import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Unit, Personnel } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const UNIT_ORDER = [
  'high-command',
  '4th-sof',
  '17th-assault',
  'vornskr-company',
  'imperial-reclamation',
  'imperial-conquest',
  'iss-beaumont',
  'dagger-squadron',
  'warrior-cadre',
  'imperial-auxiliary'
]

export function sortUnits(units: Unit[]): Unit[] {
  return [...units].sort((a, b) => {
    const indexA = UNIT_ORDER.indexOf(a.id)
    const indexB = UNIT_ORDER.indexOf(b.id)
    
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    
    return indexA - indexB
  })
}

export function sortPersonnelByRank(personnel: Personnel[]): Personnel[] {
  return [...personnel].sort((a, b) => {
    const gradeA = parseInt(a.grade) || 0
    const gradeB = parseInt(b.grade) || 0
    
    return gradeB - gradeA || a.name.localeCompare(b.name)
  })
}
