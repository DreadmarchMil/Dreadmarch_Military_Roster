export interface Personnel {
  id: string
  name: string
  rank: string
  role: string
  species: string
  affiliation: string
  status: 'active' | 'inactive' | 'kia' | 'mia'
  notes: string
}

export type PersonnelFormData = Omit<Personnel, 'id'>
