import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useFirebasePersonnel, useFirebaseUnits, useFirebaseCurrentUnit } from '@/hooks/useFirebaseData'
import { Plus, UserGear, User, Database } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import { PersonnelRosterList } from '@/components/PersonnelRosterList'
import { PersonnelForm } from '@/components/PersonnelForm'
import { PersonnelDetails } from '@/components/PersonnelDetails'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { EmptyState } from '@/components/EmptyState'
import { PasskeyDialog } from '@/components/PasskeyDialog'
import { UnitSwitcher } from '@/components/UnitSwitcher'
import { PersonnelSearch, type SearchFilters } from '@/components/PersonnelSearch'
import { ImportExportDialog } from '@/components/ImportExportDialog'
import { BootScreen } from '@/components/BootScreen'
import type { Personnel, PersonnelFormData, UserRole, Unit } from '@/lib/types'
import { DEFAULT_UNITS } from '@/lib/types'
import type { ExportData } from '@/lib/import-export'
import { sortPersonnelByRank } from '@/lib/utils'

function App() {
  const [bootComplete, setBootComplete] = useState(false)
  const { units, updateUnits, loading: unitsLoading } = useFirebaseUnits(DEFAULT_UNITS)
  const { currentUnitId, setCurrentUnitId, loading: unitIdLoading } = useFirebaseCurrentUnit(DEFAULT_UNITS[0].id)
  const { personnelByUnit, updatePersonnel, loading: personnelLoading } = useFirebasePersonnel()
  const [userRole, setUserRole] = useKV<UserRole>('user-role', 'player')
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [passkeyDialogOpen, setPasskeyDialogOpen] = useState(false)
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    statuses: [],
    rankCategories: [],
    specialties: [],
    characterTypes: [],
    assignedUnits: [],
    secondments: [],
    showInactive: false,
  })

  useEffect(() => {
    if (units && units.length < DEFAULT_UNITS.length) {
      updateUnits(DEFAULT_UNITS)
    }
    if (units) {
      const needsUpdate = DEFAULT_UNITS.some(defaultUnit => {
        const existingUnit = units.find(u => u.id === defaultUnit.id)
        return !existingUnit || existingUnit.parentId !== defaultUnit.parentId
      })
      if (needsUpdate) {
        updateUnits(DEFAULT_UNITS)
      }
    }
  }, [units, updateUnits])

  useEffect(() => {
    if (personnelByUnit) {
      let needsUpdate = false
      const updated: Record<string, Personnel[]> = {}
      
      for (const unitId in personnelByUnit) {
        const unitPersonnel = personnelByUnit[unitId]
        const updatedPersonnel = unitPersonnel.map(person => {
          let personUpdated = { ...person }
          if (!person.characterType) {
            needsUpdate = true
            personUpdated.characterType = 'pc' as const
          }
          if (!person.gender) {
            needsUpdate = true
            personUpdated.gender = ''
          }
          if (!person.grade) {
            needsUpdate = true
            personUpdated.grade = ''
          }
          return personUpdated
        })
        updated[unitId] = updatedPersonnel
      }
      
      if (needsUpdate) {
        updatePersonnel(updated)
      }
    }
  }, [])

  const isGM = userRole === 'gm'
  const currentUnit = units?.find(u => u.id === currentUnitId) || DEFAULT_UNITS[0]
  
  const getChildUnitIds = (unitId: string): string[] => {
    const childIds: string[] = []
    const children = units?.filter(u => u.parentId === unitId) || []
    for (const child of children) {
      childIds.push(child.id)
      childIds.push(...getChildUnitIds(child.id))
    }
    return childIds
  }
  
  const getPersonnelForUnit = (unitId: string): Personnel[] => {
    const currentUnitPersonnel = personnelByUnit?.[unitId] || []
    const childUnitIds = getChildUnitIds(unitId)
    const childPersonnel = childUnitIds.flatMap(childId => personnelByUnit?.[childId] || [])
    
    const allUnitsPersonnel = Object.values(personnelByUnit || {}).flat()
    const secondedPersonnel = allUnitsPersonnel.filter(p => p.secondment === unitId)
    
    const allPersonnel = [...currentUnitPersonnel, ...childPersonnel, ...secondedPersonnel]
    const uniquePersonnel = Array.from(new Map(allPersonnel.map(p => [p.id, p])).values())
    
    return uniquePersonnel
  }
  
  const allPersonnel = getPersonnelForUnit(currentUnitId || DEFAULT_UNITS[0].id)

  const availableSpecialties = useMemo(() => {
    const specialties = new Set<string>()
    allPersonnel.forEach(p => {
      if (p.specialty) specialties.add(p.specialty)
    })
    return Array.from(specialties).sort()
  }, [allPersonnel])

  const getRankCategory = (grade: string): string | null => {
    const gradeNum = parseInt(grade)
    if (isNaN(gradeNum)) return null
    if (gradeNum >= 1 && gradeNum <= 3) return 'junior-enlisted'
    if (gradeNum >= 4 && gradeNum <= 8) return 'nco'
    if (gradeNum >= 9 && gradeNum <= 16) return 'officer'
    return null
  }

  const filteredPersonnel = useMemo(() => {
    let filtered = [...allPersonnel]

    if (!filters.showInactive) {
      filtered = filtered.filter(p => p.status !== 'inactive')
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.callsign.toLowerCase().includes(query) ||
        p.rank.toLowerCase().includes(query) ||
        p.specialty.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query)
      )
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(p => filters.statuses.includes(p.status))
    }

    if (filters.rankCategories.length > 0) {
      filtered = filtered.filter(p => {
        const category = getRankCategory(p.grade)
        return category && filters.rankCategories.includes(category)
      })
    }

    if (filters.specialties.length > 0) {
      filtered = filtered.filter(p => filters.specialties.includes(p.specialty))
    }

    if (filters.characterTypes.length > 0) {
      filtered = filtered.filter(p => filters.characterTypes.includes(p.characterType))
    }

    if (filters.assignedUnits.length > 0) {
      filtered = filtered.filter(p => filters.assignedUnits.includes(p.assignedUnit))
    }

    if (filters.secondments.length > 0) {
      filtered = filtered.filter(p => p.secondment && filters.secondments.includes(p.secondment))
    }

    return sortPersonnelByRank(filtered)
  }, [allPersonnel, filters])

  const updatePersonnelForCurrentUnit = (updater: (current: Personnel[]) => Personnel[]) => {
    const unitId = currentUnitId || DEFAULT_UNITS[0].id
    const currentUnitPersonnel = personnelByUnit?.[unitId] || []
    const updatedPersonnel = {
      ...(personnelByUnit || {}),
      [unitId]: updater(currentUnitPersonnel)
    }
    updatePersonnel(updatedPersonnel)
  }

  const toggleRole = () => {
    if (isGM) {
      setUserRole('player')
      toast.success('Switched to Player mode', {
        description: 'View-only access'
      })
    } else {
      setPasskeyDialogOpen(true)
    }
  }

  const handlePasskeySuccess = () => {
    setUserRole('gm')
    toast.success('Switched to GM mode', {
      description: 'Full editing access'
    })
  }

  const handleAdd = () => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can add personnel' })
      return
    }
    setEditingPersonnel(undefined)
    setFormOpen(true)
  }

  const handleEdit = (person: Personnel) => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can edit personnel' })
      return
    }
    setEditingPersonnel(person)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can delete personnel' })
      return
    }
    const person = allPersonnel?.find(p => p.id === id)
    if (person) {
      setDeletingId(id)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDelete = () => {
    if (deletingId) {
      const person = allPersonnel?.find(p => p.id === deletingId)
      
      const allUnits = { ...(personnelByUnit || {}) }
      
      for (const unitId in allUnits) {
        const unitPersonnel = allUnits[unitId]
        const filtered = unitPersonnel.filter(p => p.id !== deletingId)
        if (filtered.length !== unitPersonnel.length) {
          allUnits[unitId] = filtered
          break
        }
      }
      
      updatePersonnel(allUnits)
      
      toast.success('Personnel record deleted', {
        description: person ? `${person.name} removed from database` : 'Record removed'
      })
      setDeletingId(null)
    }
  }

  const handleSubmit = (data: PersonnelFormData) => {
    if (editingPersonnel) {
      const updatedPerson = { ...data, id: editingPersonnel.id }
      
      const allUnits = { ...(personnelByUnit || {}) }
      let oldUnitId: string | null = null
      
      for (const unitId in allUnits) {
        const unitPersonnel = allUnits[unitId]
        const index = unitPersonnel.findIndex(p => p.id === editingPersonnel.id)
        if (index !== -1) {
          oldUnitId = unitId
          allUnits[unitId] = unitPersonnel.filter(p => p.id !== editingPersonnel.id)
          break
        }
      }
      
      const newUnitId = units?.find(u => u.name === data.assignedUnit)?.id
      
      if (newUnitId) {
        if (!allUnits[newUnitId]) {
          allUnits[newUnitId] = []
        }
        allUnits[newUnitId] = [...allUnits[newUnitId], updatedPerson]
      }
      
      updatePersonnel(allUnits)
      
      toast.success('Personnel record updated', {
        description: `${data.name} has been updated`
      })
    } else {
      const newPersonnel: Personnel = {
        ...data,
        id: Date.now().toString()
      }
      updatePersonnelForCurrentUnit(currentPersonnel => 
        [...currentPersonnel, newPersonnel]
      )
      toast.success('Personnel record created', {
        description: `${data.name} added to database`
      })
    }
  }

  const handleCardClick = (person: Personnel) => {
    setSelectedPersonnel(person)
    setDetailsOpen(true)
  }

  const handleToggleCharacterType = (id: string, newType: 'pc' | 'npc') => {
    const allUnits = { ...(personnelByUnit || {}) }
    
    for (const unitId in allUnits) {
      const unitPersonnel = allUnits[unitId]
      const index = unitPersonnel.findIndex(p => p.id === id)
      if (index !== -1) {
        const person = unitPersonnel[index]
        const updatedPerson = { ...person, characterType: newType }
        allUnits[unitId] = [
          ...unitPersonnel.slice(0, index),
          updatedPerson,
          ...unitPersonnel.slice(index + 1)
        ]
        
        if (selectedPersonnel?.id === id) {
          setSelectedPersonnel(updatedPerson)
        }
        break
      }
    }
    
    updatePersonnel(allUnits)
    
    toast.success('Character type updated', {
      description: `Changed to ${newType.toUpperCase()}`
    })
  }

  const handleStatusChange = (id: string, newStatus: Personnel['status']) => {
    const allUnits = { ...(personnelByUnit || {}) }
    
    for (const unitId in allUnits) {
      const unitPersonnel = allUnits[unitId]
      const index = unitPersonnel.findIndex(p => p.id === id)
      if (index !== -1) {
        const person = unitPersonnel[index]
        const updatedPerson = { ...person, status: newStatus }
        allUnits[unitId] = [
          ...unitPersonnel.slice(0, index),
          updatedPerson,
          ...unitPersonnel.slice(index + 1)
        ]
        
        if (selectedPersonnel?.id === id) {
          setSelectedPersonnel(updatedPerson)
        }
        break
      }
    }
    
    updatePersonnel(allUnits)
    
    toast.success('Status updated', {
      description: `Changed to ${newStatus.toUpperCase()}`
    })
  }

  const handleImport = (data: ExportData) => {
    updatePersonnel(data.personnelByUnit)
    updateUnits(data.units)
    
    const newCurrentUnit = data.units.find(u => u.id === currentUnitId)
    if (!newCurrentUnit && data.units.length > 0) {
      setCurrentUnitId(data.units[0].id)
    }
    
    toast.success('Data imported successfully', {
      description: `Loaded ${Object.values(data.personnelByUnit).flat().length} personnel records`
    })
  }

  const handleOpenImportExport = () => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can import/export data' })
      return
    }
    setImportExportOpen(true)
  }

  const deletingPersonnel = allPersonnel?.find(p => p.id === deletingId)

  if (!bootComplete || unitsLoading || unitIdLoading || personnelLoading) {
    return <BootScreen onComplete={() => setBootComplete(true)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: 'oklch(0.18 0.01 25)',
            border: '1px solid oklch(0.3 0.05 25)',
            color: 'oklch(0.85 0.01 25)',
          },
        }}
      />
      
      <div className="sticky top-0 z-50 border-b-4 border-accent bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary mb-4">
            Dreadmarch Military Personnel Database
          </h1>
          <div className="flex items-center justify-between gap-4">
            <UnitSwitcher 
              units={units || DEFAULT_UNITS}
              currentUnitId={currentUnitId || DEFAULT_UNITS[0].id}
              onUnitChange={setCurrentUnitId}
            />
            <div className="flex items-center gap-3">
              {isGM && (
                <Button
                  onClick={handleOpenImportExport}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 font-semibold uppercase tracking-wide"
                >
                  <Database size={20} className="mr-2" />
                  <span className="hidden sm:inline">Data</span>
                </Button>
              )}
              <Button
                onClick={toggleRole}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 font-semibold uppercase tracking-wide"
              >
                {isGM ? (
                  <>
                    <UserGear size={20} className="mr-2" />
                    <span className="hidden sm:inline">GM Mode</span>
                    <span className="sm:hidden">GM</span>
                  </>
                ) : (
                  <>
                    <User size={20} className="mr-2" />
                    <span className="hidden sm:inline">Player Mode</span>
                    <span className="sm:hidden">Player</span>
                  </>
                )}
              </Button>
              {isGM && (
                <Button
                  onClick={handleAdd}
                  className="bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
                >
                  <Plus size={20} className="mr-2" />
                  <span className="hidden sm:inline">Add Personnel</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {allPersonnel.length === 0 ? (
          <EmptyState onAddClick={handleAdd} isGM={isGM} />
        ) : (
          <div className="space-y-6">
            <PersonnelSearch
              filters={filters}
              onFiltersChange={setFilters}
              availableSpecialties={availableSpecialties}
              availableUnits={units || DEFAULT_UNITS}
            />
            {filteredPersonnel.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No personnel match your search criteria</p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ searchQuery: '', statuses: [], rankCategories: [], specialties: [], characterTypes: [], assignedUnits: [], secondments: [], showInactive: false })}
                  className="mt-4 border-primary/30 hover:bg-primary/10"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <PersonnelRosterList 
                personnel={filteredPersonnel} 
                onRowClick={handleCardClick}
                onStatusChange={handleStatusChange}
                isGM={isGM}
                currentUnitId={currentUnitId || DEFAULT_UNITS[0].id}
              />
            )}
          </div>
        )}
      </main>

      <PersonnelForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        personnel={editingPersonnel}
        units={units || DEFAULT_UNITS}
      />

      <PersonnelDetails
        personnel={selectedPersonnel}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleCharacterType={handleToggleCharacterType}
        onStatusChange={handleStatusChange}
        isGM={isGM}
      />

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        personnelName={deletingPersonnel?.name || ''}
      />

      <PasskeyDialog
        open={passkeyDialogOpen}
        onOpenChange={setPasskeyDialogOpen}
        onSuccess={handlePasskeySuccess}
      />

      <ImportExportDialog
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        personnelByUnit={personnelByUnit || {}}
        units={units || DEFAULT_UNITS}
        onImport={handleImport}
      />
    </div>
  )
}

export default App