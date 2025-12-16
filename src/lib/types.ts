export interface Personnel {
  id: string
  name: string
  callsign: string
  rank: string
  role: string
  specialty: string
  species: string
  gender: string
  assignedUnit: string
  secondment?: string
  status: 'available' | 'deployed' | 'inactive' | 'wia' | 'kia'
  characterType: 'pc' | 'npc'
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
  { id: 'high-command', name: 'Dreadmarch Military High Command' },
  { id: '4th-sof', name: '4th Special Operations Brigade' },
  { id: '17th-assault', name: '17th Assault Group', parentId: '4th-sof' },
  { id: 'vornskr-company', name: 'Vornskr Company', parentId: '17th-assault' },
  { id: 'imperial-reclamation', name: 'Imperial Reclamation Service Detachment', parentId: 'vornskr-company' },
  { id: 'imperial-conquest', name: 'Imperial Conquest Consolidation Corps', parentId: 'vornskr-company' },
  { id: 'iss-beaumont', name: 'I.S.S. Beaumont Hill', parentId: '17th-assault' },
  { id: 'dagger-squadron', name: 'Dagger Squadron', parentId: '17th-assault' },
  { id: 'warrior-cadre', name: 'Warrior Cadre', parentId: '17th-assault' },
  { id: 'imperial-auxiliary', name: 'Imperial Auxiliary', parentId: '17th-assault' }
]
