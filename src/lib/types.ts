export interface Personnel {
  id: string
  name: string
  callsign: string
  rank: string
  role: string
  specialty: string
  species: string
  primaryUnit: string
  detachment: string
  status: 'available' | 'deployed' | 'inactive' | 'wia' | 'kia'
  notes: string
}

export type PersonnelFormData = Omit<Personnel, 'id'>

export type UserRole = 'player' | 'gm'

export interface Unit {
  id: string
  name: string
  parentId?: string
}

export const DEFAULT_UNITS: Unit[] = [
  { id: '4th-sof', name: '4th Special Operations Brigade' },
  { id: '17th-assault', name: '17th Assault Group', parentId: '4th-sof' },
  { id: 'warrior-cadre', name: 'Warrior Cadre', parentId: '17th-assault' }
]
