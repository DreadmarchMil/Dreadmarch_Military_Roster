import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PencilSimple, Trash, Plus, Warning, TreeStructure } from '@phosphor-icons/react'
import type { Unit, Personnel } from '@/lib/types'
import { sortUnits } from '@/lib/utils'
import { toast } from 'sonner'

interface UnitManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  units: Unit[]
  updateUnits: (units: Unit[]) => void
  personnelByUnit: Record<string, Personnel[]>
  updatePersonnel: (personnelByUnit: Record<string, Personnel[]>) => void
}

export function UnitManagementDialog({
  open,
  onOpenChange,
  units,
  updateUnits,
  personnelByUnit,
  updatePersonnel
}: UnitManagementDialogProps) {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [newUnitName, setNewUnitName] = useState('')
  const [newUnitParentId, setNewUnitParentId] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [reassignUnitId, setReassignUnitId] = useState<string>('unassigned')

  const sortedUnits = useMemo(() => sortUnits(units), [units])

  // Helper to get unit depth for indentation
  const getUnitDepth = (unitId: string): number => {
    const unit = units.find(u => u.id === unitId)
    if (!unit?.parentId) return 0
    return 1 + getUnitDepth(unit.parentId)
  }

  // Helper to generate ID from name
  const generateUnitId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Helper to check for circular references
  const wouldCreateCircularReference = (unitId: string, newParentId: string): boolean => {
    if (!newParentId || newParentId === '') return false
    if (unitId === newParentId) return true
    
    let currentParentId = newParentId
    const visited = new Set<string>()
    
    while (currentParentId) {
      if (visited.has(currentParentId)) return true // Detected loop
      if (currentParentId === unitId) return true
      visited.add(currentParentId)
      
      const parent = units.find(u => u.id === currentParentId)
      currentParentId = parent?.parentId || ''
    }
    
    return false
  }

  // Helper to get personnel count for a unit
  const getPersonnelCount = (unitId: string): number => {
    return personnelByUnit[unitId]?.length || 0
  }

  const handleStartAdd = () => {
    setNewUnitName('')
    setNewUnitParentId('')
    setMode('add')
  }

  const handleStartEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setNewUnitName(unit.name)
    setNewUnitParentId(unit.parentId || '')
    setMode('edit')
  }

  const handleCancelEdit = () => {
    setMode('list')
    setEditingUnit(null)
    setNewUnitName('')
    setNewUnitParentId('')
  }

  const handleSaveUnit = () => {
    if (!newUnitName.trim()) {
      toast.error('Unit name is required')
      return
    }

    const trimmedName = newUnitName.trim()

    if (mode === 'add') {
      // Check for duplicate name
      if (units.some(u => u.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast.error('Unit name already exists')
        return
      }

      const newId = generateUnitId(trimmedName)
      
      // Check for duplicate ID
      if (units.some(u => u.id === newId)) {
        toast.error('Generated unit ID already exists, please use a different name')
        return
      }

      // Check for circular reference
      if (newUnitParentId && wouldCreateCircularReference(newId, newUnitParentId)) {
        toast.error('Cannot create circular parent reference')
        return
      }

      const newUnit: Unit = {
        id: newId,
        name: trimmedName,
        ...(newUnitParentId && { parentId: newUnitParentId })
      }

      updateUnits([...units, newUnit])
      toast.success('Unit created', { description: `${trimmedName} has been added` })
      handleCancelEdit()
    } else if (mode === 'edit' && editingUnit) {
      // Check for duplicate name (excluding current unit)
      if (units.some(u => u.id !== editingUnit.id && u.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast.error('Unit name already exists')
        return
      }

      // Check for circular reference
      if (newUnitParentId && wouldCreateCircularReference(editingUnit.id, newUnitParentId)) {
        toast.error('Cannot create circular parent reference')
        return
      }

      const oldName = editingUnit.name
      const updatedUnit: Unit = {
        ...editingUnit,
        name: trimmedName,
        parentId: newUnitParentId || undefined
      }

      // Update unit
      const updatedUnits = units.map(u => u.id === editingUnit.id ? updatedUnit : u)
      updateUnits(updatedUnits)

      // If name changed, update all personnel references
      if (oldName !== trimmedName) {
        const updatedPersonnelByUnit = { ...personnelByUnit }
        let personnelUpdated = false

        for (const unitId in updatedPersonnelByUnit) {
          const unitPersonnel = updatedPersonnelByUnit[unitId]
          const updatedPersonnel = unitPersonnel.map(person => {
            const updated = { ...person }
            
            if (person.assignedUnit === oldName) {
              updated.assignedUnit = trimmedName
              personnelUpdated = true
            }
            
            if (person.secondment === oldName) {
              updated.secondment = trimmedName
              personnelUpdated = true
            }
            
            return updated
          })
          
          updatedPersonnelByUnit[unitId] = updatedPersonnel
        }

        if (personnelUpdated) {
          updatePersonnel(updatedPersonnelByUnit)
        }
      }

      toast.success('Unit updated', { description: `${trimmedName} has been modified` })
      handleCancelEdit()
    }
  }

  const handleStartDelete = (unit: Unit) => {
    setUnitToDelete(unit)
    setReassignUnitId('unassigned')
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!unitToDelete) return

    // Cannot delete unassigned unit
    if (unitToDelete.id === 'unassigned') {
      toast.error('Cannot delete the unassigned unit')
      setDeleteDialogOpen(false)
      setUnitToDelete(null)
      return
    }

    const personnelCount = getPersonnelCount(unitToDelete.id)

    // Reassign personnel
    if (personnelCount > 0) {
      const personnelToReassign = personnelByUnit[unitToDelete.id] || []
      const targetUnitName = units.find(u => u.id === reassignUnitId)?.name || ''
      
      const updatedPersonnelByUnit = { ...personnelByUnit }
      
      // Update personnel records
      const updatedPersonnel = personnelToReassign.map(person => ({
        ...person,
        assignedUnit: targetUnitName
      }))

      // Remove from old unit
      delete updatedPersonnelByUnit[unitToDelete.id]
      
      // Add to new unit
      if (!updatedPersonnelByUnit[reassignUnitId]) {
        updatedPersonnelByUnit[reassignUnitId] = []
      }
      updatedPersonnelByUnit[reassignUnitId] = [
        ...updatedPersonnelByUnit[reassignUnitId],
        ...updatedPersonnel
      ]
      
      updatePersonnel(updatedPersonnelByUnit)
    }

    // Move child units up to parent (or make them top-level)
    const updatedUnits = units
      .filter(u => u.id !== unitToDelete.id)
      .map(u => {
        if (u.parentId === unitToDelete.id) {
          return {
            ...u,
            parentId: unitToDelete.parentId || undefined
          }
        }
        return u
      })

    updateUnits(updatedUnits)
    
    toast.success('Unit deleted', { 
      description: personnelCount > 0 
        ? `${unitToDelete.name} deleted and ${personnelCount} personnel reassigned`
        : `${unitToDelete.name} has been removed`
    })
    
    setDeleteDialogOpen(false)
    setUnitToDelete(null)
  }

  const availableParentUnits = useMemo(() => {
    // Helper to get all descendant unit IDs
    const getDescendants = (unitId: string): string[] => {
      const descendants: string[] = []
      const children = units.filter(u => u.parentId === unitId)
      
      for (const child of children) {
        descendants.push(child.id)
        descendants.push(...getDescendants(child.id))
      }
      
      return descendants
    }

    if (mode === 'edit' && editingUnit) {
      // Exclude the current unit and its descendants from parent options
      const excludedIds = new Set([editingUnit.id, ...getDescendants(editingUnit.id)])
      return units.filter(u => !excludedIds.has(u.id) && u.id !== 'unassigned')
    }
    return units.filter(u => u.id !== 'unassigned')
  }, [mode, editingUnit, units])

  const reassignableUnits = useMemo(() => {
    // Helper to get all descendant unit IDs
    const getDescendants = (unitId: string): string[] => {
      const descendants: string[] = []
      const children = units.filter(u => u.parentId === unitId)
      
      for (const child of children) {
        descendants.push(child.id)
        descendants.push(...getDescendants(child.id))
      }
      
      return descendants
    }

    if (!unitToDelete) return units
    // Exclude the unit being deleted and its descendants
    const excludedIds = new Set([unitToDelete.id, ...getDescendants(unitToDelete.id)])
    return units.filter(u => !excludedIds.has(u.id))
  }, [unitToDelete, units])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-card border-2 border-primary/30 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <TreeStructure size={28} className="text-primary" />
              Unit Management
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage military units and their hierarchical structure
            </DialogDescription>
          </DialogHeader>

          {mode === 'list' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-4">
                <Button
                  onClick={handleStartAdd}
                  className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
                >
                  <Plus size={20} className="mr-2" />
                  Add New Unit
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                  {sortedUnits.map((unit) => {
                    const depth = getUnitDepth(unit.id)
                    const personnelCount = getPersonnelCount(unit.id)
                    const isProtected = unit.id === 'unassigned'

                    return (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-3 rounded border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                        style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-foreground uppercase tracking-wide">
                            {depth > 0 && '└ '}{unit.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {personnelCount} personnel
                            {unit.parentId && ` • Child of ${units.find(u => u.id === unit.parentId)?.name}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!isProtected && (
                            <>
                              <Button
                                onClick={() => handleStartEdit(unit)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <PencilSimple size={18} />
                              </Button>
                              <Button
                                onClick={() => handleStartDelete(unit)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash size={18} />
                              </Button>
                            </>
                          )}
                          {isProtected && (
                            <span className="text-xs text-muted-foreground uppercase">Protected</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unit-name" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Unit Name *
                </Label>
                <Input
                  id="unit-name"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="bg-secondary/50 border-primary/30"
                  placeholder="Enter unit name"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent-unit" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Parent Unit (Optional)
                </Label>
                <Select value={newUnitParentId} onValueChange={setNewUnitParentId}>
                  <SelectTrigger className="bg-secondary/50 border-primary/30">
                    <SelectValue placeholder="None (Top-level unit)" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/30">
                    <SelectItem value="">None (Top-level unit)</SelectItem>
                    {sortUnits(availableParentUnits).map((unit) => {
                      const depth = getUnitDepth(unit.id)
                      return (
                        <SelectItem 
                          key={unit.id} 
                          value={unit.id}
                          style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
                        >
                          {depth > 0 && '└ '}{unit.name}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 border-primary/30 hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveUnit}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
                >
                  {mode === 'add' ? 'Create Unit' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-2 border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
              <Warning size={24} />
              Delete Unit
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-3">
              {unitToDelete && (
                <>
                  <p>
                    Are you sure you want to delete <strong className="text-foreground">{unitToDelete.name}</strong>?
                  </p>
                  
                  {getPersonnelCount(unitToDelete.id) > 0 && (
                    <div className="space-y-2">
                      <p className="text-destructive font-semibold">
                        This unit has {getPersonnelCount(unitToDelete.id)} personnel assigned.
                      </p>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Reassign Personnel To:
                        </Label>
                        <Select value={reassignUnitId} onValueChange={setReassignUnitId}>
                          <SelectTrigger className="bg-secondary/50 border-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary/30">
                            {sortUnits(reassignableUnits).map((unit) => {
                              const depth = getUnitDepth(unit.id)
                              return (
                                <SelectItem 
                                  key={unit.id} 
                                  value={unit.id}
                                  style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
                                >
                                  {depth > 0 && '└ '}{unit.name}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {units.filter(u => u.parentId === unitToDelete.id).length > 0 && (
                    <p className="text-foreground">
                      Child units will be moved to{' '}
                      {unitToDelete.parentId 
                        ? `"${units.find(u => u.id === unitToDelete.parentId)?.name}"` 
                        : 'top-level'}.
                    </p>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/30 hover:bg-primary/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
