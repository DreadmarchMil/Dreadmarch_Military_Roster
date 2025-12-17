import { useState } from 'react'
import { MagnifyingGlass, Funnel, X } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export interface SearchFilters {
  searchQuery: string
  statuses: string[]
  rankCategories: string[]
  specialties: string[]
  characterTypes: string[]
  assignedUnits: string[]
  secondments: string[]
  showInactive: boolean
}

interface PersonnelSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableSpecialties: string[]
  availableUnits: Array<{ id: string; name: string }>
}

export function PersonnelSearch({
  filters,
  onFiltersChange,
  availableSpecialties,
  availableUnits,
}: PersonnelSearchProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery)

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'wia', label: 'WIA' },
    { value: 'kia', label: 'KIA' },
  ]

  const characterTypeOptions = [
    { value: 'pc', label: 'PC (Player Character)' },
    { value: 'npc', label: 'NPC (Non-Player Character)' },
  ]

  const rankCategoryOptions = [
    { value: 'junior-enlisted', label: 'Junior Enlisted (Grade 1-3)' },
    { value: 'nco', label: 'NCOs (Grade 4-8)' },
    { value: 'officer', label: 'Officers (Grade 9+)' },
  ]

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onFiltersChange({ ...filters, searchQuery: value })
  }

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const handleCharacterTypeToggle = (type: string) => {
    const newTypes = filters.characterTypes.includes(type)
      ? filters.characterTypes.filter(t => t !== type)
      : [...filters.characterTypes, type]
    onFiltersChange({ ...filters, characterTypes: newTypes })
  }

  const handleRankCategoryToggle = (category: string) => {
    const newCategories = filters.rankCategories.includes(category)
      ? filters.rankCategories.filter(c => c !== category)
      : [...filters.rankCategories, category]
    onFiltersChange({ ...filters, rankCategories: newCategories })
  }

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty]
    onFiltersChange({ ...filters, specialties: newSpecialties })
  }

  const handleAssignedUnitToggle = (unitId: string) => {
    const newUnits = filters.assignedUnits.includes(unitId)
      ? filters.assignedUnits.filter(u => u !== unitId)
      : [...filters.assignedUnits, unitId]
    onFiltersChange({ ...filters, assignedUnits: newUnits })
  }

  const handleSecondmentToggle = (unitId: string) => {
    const newSecondments = filters.secondments.includes(unitId)
      ? filters.secondments.filter(s => s !== unitId)
      : [...filters.secondments, unitId]
    onFiltersChange({ ...filters, secondments: newSecondments })
  }

  const clearAllFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      searchQuery: '',
      statuses: [],
      rankCategories: [],
      specialties: [],
      characterTypes: [],
      assignedUnits: [],
      secondments: [],
      showInactive: false,
    })
  }

  const handleShowInactiveToggle = () => {
    onFiltersChange({ ...filters, showInactive: !filters.showInactive })
  }

  const hasActiveFilters =
    filters.searchQuery ||
    filters.statuses.length > 0 ||
    filters.rankCategories.length > 0 ||
    filters.specialties.length > 0 ||
    filters.characterTypes.length > 0 ||
    filters.assignedUnits.length > 0 ||
    filters.secondments.length > 0

  const activeFilterCount =
    filters.statuses.length +
    filters.rankCategories.length +
    filters.specialties.length +
    filters.characterTypes.length +
    filters.assignedUnits.length +
    filters.secondments.length +
    (filters.searchQuery ? 1 : 0)

  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1">
        <MagnifyingGlass
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Search by name, callsign, rank, or specialty..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-card border-primary/30 focus:border-accent"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 font-semibold uppercase tracking-wide relative"
          >
            <Funnel size={20} className="mr-2" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-card border-primary/30" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wide text-sm">Filters</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="show-inactive"
                    checked={filters.showInactive}
                    onCheckedChange={handleShowInactiveToggle}
                    className="scale-75"
                  />
                  <Label htmlFor="show-inactive" className="text-[10px] text-muted-foreground cursor-pointer uppercase tracking-wide">
                    Show Inactive
                  </Label>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} className="mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Character Type
                </Label>
                <div className="space-y-2">
                  {characterTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={filters.characterTypes.includes(option.value)}
                        onCheckedChange={() => handleCharacterTypeToggle(option.value)}
                      />
                      <label
                        htmlFor={`type-${option.value}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Status
                </Label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.statuses.includes(option.value)}
                        onCheckedChange={() => handleStatusToggle(option.value)}
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Rank Category
                </Label>
                <div className="space-y-2">
                  {rankCategoryOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rank-category-${option.value}`}
                        checked={filters.rankCategories.includes(option.value)}
                        onCheckedChange={() => handleRankCategoryToggle(option.value)}
                      />
                      <label
                        htmlFor={`rank-category-${option.value}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {availableSpecialties.length > 0 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Specialty
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableSpecialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={filters.specialties.includes(specialty)}
                          onCheckedChange={() => handleSpecialtyToggle(specialty)}
                        />
                        <label
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {specialty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableUnits.length > 0 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Assigned Unit
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableUnits.map((unit) => (
                      <div key={unit.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assigned-${unit.id}`}
                          checked={filters.assignedUnits.includes(unit.id)}
                          onCheckedChange={() => handleAssignedUnitToggle(unit.id)}
                        />
                        <label
                          htmlFor={`assigned-${unit.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {unit.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableUnits.length > 0 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Secondment
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableUnits.map((unit) => (
                      <div key={unit.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`secondment-${unit.id}`}
                          checked={filters.secondments.includes(unit.id)}
                          onCheckedChange={() => handleSecondmentToggle(unit.id)}
                        />
                        <label
                          htmlFor={`secondment-${unit.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {unit.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
