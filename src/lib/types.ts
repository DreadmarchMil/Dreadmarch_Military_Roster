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
