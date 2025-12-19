import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PencilSimple, Trash, Plus, Warning, TreeStructure, DotsSixVertical } from '@phosphor-icons/react'
import { Reorder, useDragControls } from 'framer-motion'
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
  const [newUnitParentId, setNewUnitParentId] = useState<string>('__NONE__')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [reassignUnitId, setReassignUnitId] = useState<string>('unassigned')
  const [reorderableUnits, setReorderableUnits] = useState<Unit[]>([])

  const sortedUnits = useMemo(() => sortUnits(units), [units])

  // Update reorderable units when sortedUnits changes
  useMemo(() => {
    setReorderableUnits(sortedUnits)
  }, [sortedUnits])

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
    if (!newParentId || newParentId === '' || newParentId === '__NONE__') return false
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
    setNewUnitParentId('__NONE__')
    setMode('add')
  }

  const handleStartEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setNewUnitName(unit.name)
    setNewUnitParentId(unit.parentId || '__NONE__')
    setMode('edit')
  }

  const handleCancelEdit = () => {
    setMode('list')
    setEditingUnit(null)
    setNewUnitName('')
    setNewUnitParentId('__NONE__')
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
      if (newUnitParentId && newUnitParentId !== '__NONE__' && wouldCreateCircularReference(newId, newUnitParentId)) {
        toast.error('Cannot create circular parent reference')
        return
      }

      const newUnit: Unit = {
        id: newId,
        name: trimmedName,
        ...(newUnitParentId && newUnitParentId !== '__NONE__' && { parentId: newUnitParentId })
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
      if (newUnitParentId && newUnitParentId !== '__NONE__' && wouldCreateCircularReference(editingUnit.id, newUnitParentId)) {
        toast.error('Cannot create circular parent reference')
        return
      }

      const oldName = editingUnit.name
      const updatedUnit: Unit = {
        ...editingUnit,
        name: trimmedName,
        parentId: newUnitParentId && newUnitParentId !== '__NONE__' ? newUnitParentId : undefined
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
    const getDescendantIds = (unitId: string): string[] => {
      const descendants: string[] = []
      const children = units.filter(u => u.parentId === unitId)
      
      for (const child of children) {
        descendants.push(child.id)
        descendants.push(...getDescendantIds(child.id))
      }
      
      return descendants
    }

    if (mode === 'edit' && editingUnit) {
      // Exclude the current unit and its descendants from parent options
      const excludedIds = new Set([editingUnit.id, ...getDescendantIds(editingUnit.id)])
      return units.filter(u => !excludedIds.has(u.id) && u.id !== 'unassigned')
    }
    return units.filter(u => u.id !== 'unassigned')
  }, [mode, editingUnit, units])

  const reassignableUnits = useMemo(() => {
    // Helper to get all descendant unit IDs
    const getDescendantIds = (unitId: string): string[] => {
      const descendants: string[] = []
      const children = units.filter(u => u.parentId === unitId)
      
      for (const child of children) {
        descendants.push(child.id)
        descendants.push(...getDescendantIds(child.id))
      }
      
      return descendants
    }

    if (!unitToDelete) return units
    // Exclude the unit being deleted and its descendants
    const excludedIds = new Set([unitToDelete.id, ...getDescendantIds(unitToDelete.id)])
    return units.filter(u => !excludedIds.has(u.id))
  }, [unitToDelete, units])

  // Handle reorder of units via drag-and-drop
  const handleReorder = (newOrder: Unit[]) => {
    setReorderableUnits(newOrder)
    
    // Assign sortOrder values based on the new position
    const updatedUnits = units.map(unit => {
      const newIndex = newOrder.findIndex(u => u.id === unit.id)
      if (newIndex === -1) return unit // Unit not in the reordered list (e.g., unassigned)
      
      return {
        ...unit,
        sortOrder: newIndex
      }
    })
    
    updateUnits(updatedUnits)
    toast.success('Unit order updated')
  }

  // Component for a draggable unit row
  const DraggableUnitRow = ({ unit }: { unit: Unit }) => {
    const dragControls = useDragControls()
    const depth = getUnitDepth(unit.id)
    const personnelCount = getPersonnelCount(unit.id)
    const isProtected = unit.id === 'unassigned'

    return (
      <Reorder.Item
        key={unit.id}
        value={unit}
        dragListener={false}
        dragControls={dragControls}
        className="flex items-center justify-between p-3 rounded border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
        style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}
        whileDrag={{
          scale: 1.02,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          opacity: 0.9,
          cursor: 'grabbing'
        }}
      >
        {!isProtected && (
          <div
            className="mr-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <DotsSixVertical size={20} weight="bold" />
          </div>
        )}
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
      </Reorder.Item>
    )
  }

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

              <ScrollArea className="h-[500px] overflow-hidden pr-4">
                <Reorder.Group
                  axis="y"
                  values={reorderableUnits}
                  onReorder={handleReorder}
                  className="space-y-2"
                >
                  {reorderableUnits.map((unit) => (
                    <DraggableUnitRow key={unit.id} unit={unit} />
                  ))}
                </Reorder.Group>
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
                    <SelectItem value="__NONE__">None (Top-level unit)</SelectItem>
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
