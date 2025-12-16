import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Unit } from '@/lib/types'

interface UnitSwitcherProps {
  units: Unit[]
  currentUnitId: string
  onUnitChange: (unitId: string) => void
}

export function UnitSwitcher({ units, currentUnitId, onUnitChange }: UnitSwitcherProps) {
  const currentUnit = units.find(u => u.id === currentUnitId)

  const getUnitDepth = (unitId: string): number => {
    const unit = units.find(u => u.id === unitId)
    if (!unit?.parentId) return 0
    return 1 + getUnitDepth(unit.parentId)
  }

  const sortedUnits = [...units].sort((a, b) => {
    const getPath = (unit: Unit): string => {
      if (!unit.parentId) return unit.id
      const parent = units.find(u => u.id === unit.parentId)
      return parent ? `${getPath(parent)}/${unit.id}` : unit.id
    }
    return getPath(a).localeCompare(getPath(b))
  })

  return (
    <Select value={currentUnitId} onValueChange={onUnitChange}>
      <SelectTrigger className="w-[280px] border-primary/30 bg-card/80 font-semibold uppercase tracking-wide">
        <SelectValue placeholder="Select Unit">
          {currentUnit?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-primary/30">
        {sortedUnits.map((unit) => {
          const depth = getUnitDepth(unit.id)
          return (
            <SelectItem 
              key={unit.id} 
              value={unit.id}
              className="uppercase tracking-wide font-semibold cursor-pointer"
              style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
            >
              {depth > 0 && '└ '}{unit.name}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
