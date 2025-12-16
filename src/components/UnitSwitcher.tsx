import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Unit } from '@/lib/types'

interface UnitSwitcherProps {
  units: Unit[]
  currentUnitId: string
  onUnitChange: (unitId: string) => void
}

export function UnitSwitcher({ units, currentUnitId, onUnitChange }: UnitSwitcherProps) {
  const currentUnit = units.find(u => u.id === currentUnitId)

  return (
    <Select value={currentUnitId} onValueChange={onUnitChange}>
      <SelectTrigger className="w-[240px] border-primary/30 bg-card/80 font-semibold uppercase tracking-wide">
        <SelectValue placeholder="Select Unit">
          {currentUnit?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-primary/30">
        {units.map((unit) => (
          <SelectItem 
            key={unit.id} 
            value={unit.id}
            className="uppercase tracking-wide font-semibold cursor-pointer"
          >
            {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
