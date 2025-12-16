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
  ranks: string[]
  specialties: string[]
}

interface PersonnelSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableRanks: string[]
  availableSpecialties: string[]
}

export function PersonnelSearch({
  filters,
  onFiltersChange,
  availableRanks,
  availableSpecialties,
}: PersonnelSearchProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery)

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'wia', label: 'WIA' },
    { value: 'kia', label: 'KIA' },
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

  const handleRankToggle = (rank: string) => {
    const newRanks = filters.ranks.includes(rank)
      ? filters.ranks.filter(r => r !== rank)
      : [...filters.ranks, rank]
    onFiltersChange({ ...filters, ranks: newRanks })
  }

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty]
    onFiltersChange({ ...filters, specialties: newSpecialties })
  }

  const clearAllFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      searchQuery: '',
      statuses: [],
      ranks: [],
      specialties: [],
    })
  }

  const hasActiveFilters =
    filters.searchQuery ||
    filters.statuses.length > 0 ||
    filters.ranks.length > 0 ||
    filters.specialties.length > 0

  const activeFilterCount =
    filters.statuses.length +
    filters.ranks.length +
    filters.specialties.length +
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

            <div className="space-y-3">
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

              {availableRanks.length > 0 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Rank
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableRanks.map((rank) => (
                      <div key={rank} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rank-${rank}`}
                          checked={filters.ranks.includes(rank)}
                          onCheckedChange={() => handleRankToggle(rank)}
                        />
                        <label
                          htmlFor={`rank-${rank}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {rank}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
