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
  status: 'active' | 'inactive' | 'kia' | 'mia'
  notes: string
}

export type PersonnelFormData = Omit<Personnel, 'id'>
