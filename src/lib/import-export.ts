import type { Personnel, Unit } from './types'

export interface ExportData {
  version: string
  exportDate: string
  personnelByUnit: Record<string, Personnel[]>
  units: Unit[]
}

export function exportData(personnelByUnit: Record<string, Personnel[]>, units: Unit[]): string {
  const data: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    personnelByUnit,
    units
  }
  return JSON.stringify(data, null, 2)
}

export function downloadJSON(data: string, filename: string) {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  error?: string
  data?: ExportData
}

export function validateImportData(data: any): ImportResult {
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid file format' }
  }

  if (!data.version) {
    return { success: false, error: 'Missing version information' }
  }

  if (!data.personnelByUnit || typeof data.personnelByUnit !== 'object') {
    return { success: false, error: 'Missing or invalid personnel data' }
  }

  if (!data.units || !Array.isArray(data.units)) {
    return { success: false, error: 'Missing or invalid units data' }
  }

  // Migrate and validate personnel records with default values
  for (const unitId in data.personnelByUnit) {
    const personnel = data.personnelByUnit[unitId]
    if (!Array.isArray(personnel)) {
      return { success: false, error: `Invalid personnel data for unit ${unitId}` }
    }

    for (let i = 0; i < personnel.length; i++) {
      const person = personnel[i]
      
      // Only require essential fields
      if (!person.id || !person.name) {
        return { success: false, error: 'Personnel record missing required fields (id, name)' }
      }

      // Auto-fill missing fields with sensible defaults
      personnel[i] = {
        ...person,
        characterType: person.characterType || 'pc',
        status: person.status || 'available',
        gender: person.gender ?? '',
        grade: person.grade ?? '',
        secondment: person.secondment ?? '',
        callsign: person.callsign ?? '',
        role: person.role ?? '',
        specialty: person.specialty ?? '',
        species: person.species ?? '',
        notes: person.notes ?? '',
        rank: person.rank ?? '',
        assignedUnit: person.assignedUnit ?? ''
      }
    }
  }

  return { success: true, data: data as ExportData }
}

export async function parseImportFile(file: File): Promise<ImportResult> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    return validateImportData(data)
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to parse file' 
    }
  }
}
