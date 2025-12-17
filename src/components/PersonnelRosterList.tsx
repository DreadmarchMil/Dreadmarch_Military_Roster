import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CaretUp, CaretDown } from '@phosphor-icons/react'
import type { Personnel } from '@/lib/types'

type SortField = 'name' | 'callsign' | 'rank' | 'role' | 'assignedUnit' | 'secondment' | 'specialty' | 'status' | 'characterType'
type SortDirection = 'asc' | 'desc'

interface PersonnelRosterListProps {
  personnel: Personnel[]
  onRowClick: (personnel: Personnel) => void
  onStatusChange?: (id: string, status: Personnel['status']) => void
  isGM?: boolean
  currentUnitId?: string
}

export function PersonnelRosterList({ personnel, onRowClick, onStatusChange, isGM, currentUnitId }: PersonnelRosterListProps) {
  const [sortField, setSortField] = useState<SortField | null>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const statusColors = {
    available: 'bg-accent/20 text-accent border-accent/30',
    deployed: 'bg-primary/20 text-primary border-primary/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    wia: 'bg-secondary text-secondary-foreground border-secondary',
    kia: 'bg-destructive/20 text-destructive border-destructive/30'
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedPersonnel = [...personnel].sort((a, b) => {
    if (!sortField) return 0

    let compareResult = 0
    let aValue: string | number = ''
    let bValue: string | number = ''

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'callsign':
        aValue = a.callsign.toLowerCase()
        bValue = b.callsign.toLowerCase()
        break
      case 'rank':
        aValue = parseInt(a.grade) || 0
        bValue = parseInt(b.grade) || 0
        compareResult = (aValue as number) - (bValue as number)
        if (compareResult === 0) {
          return a.name.localeCompare(b.name)
        }
        return sortDirection === 'asc' ? compareResult : -compareResult
      case 'assignedUnit':
        aValue = a.assignedUnit.toLowerCase()
        bValue = b.assignedUnit.toLowerCase()
        break
      case 'secondment':
        aValue = (a.secondment || '').toLowerCase()
        bValue = (b.secondment || '').toLowerCase()
        break
      case 'specialty':
        aValue = a.specialty.toLowerCase()
        bValue = b.specialty.toLowerCase()
        break
      case 'role':
        aValue = a.role.toLowerCase()
        bValue = b.role.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'characterType':
        aValue = a.characterType
        bValue = b.characterType
        break
    }

    if (aValue < bValue) compareResult = -1
    else if (aValue > bValue) compareResult = 1
    else compareResult = 0

    if (compareResult === 0) {
      const gradeA = parseInt(a.grade) || 0
      const gradeB = parseInt(b.grade) || 0
      if (gradeA !== gradeB) {
        return gradeB - gradeA
      }
      return a.name.localeCompare(b.name)
    }

    return sortDirection === 'asc' ? compareResult : -compareResult
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <CaretUp size={12} className="inline ml-1" weight="bold" />
    ) : (
      <CaretDown size={12} className="inline ml-1" weight="bold" />
    )
  }

  return (
    <div className="border border-border bg-card text-xs">
      <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1.2fr_1.8fr_1.2fr_1fr_0.7fr] gap-2 px-4 py-2 bg-primary/10 border-b-2 border-primary/30 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('name')}>
          Name<SortIcon field="name" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('callsign')}>
          Callsign<SortIcon field="callsign" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('rank')}>
          Rank<SortIcon field="rank" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('role')}>
          Role<SortIcon field="role" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('specialty')}>
          Specialty<SortIcon field="specialty" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('assignedUnit')}>
          Assigned Unit<SortIcon field="assignedUnit" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('secondment')}>
          Secondment<SortIcon field="secondment" />
        </div>
        <div className="cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('status')}>
          Status<SortIcon field="status" />
        </div>
        <div className="text-right pr-2 cursor-pointer hover:text-accent transition-colors" onClick={() => handleSort('characterType')}>
          Type<SortIcon field="characterType" />
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {sortedPersonnel.map((person) => (
          <div
            key={person.id}
            className="grid grid-cols-[2fr_1.2fr_1.2fr_1.2fr_1.2fr_1.8fr_1.2fr_1fr_0.7fr] gap-2 px-4 py-2 hover:bg-primary/5 transition-colors group items-center"
          >
            <div 
              className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
              onClick={() => onRowClick(person)}
            >
              {person.name}
              {currentUnitId && person.secondment === currentUnitId && (
                <Badge className="h-4 px-1 text-[0.6rem] bg-accent/20 text-accent border-accent/50">TDY</Badge>
              )}
            </div>
            <div 
              className="text-accent cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.callsign || '—'}
            </div>
            <div 
              className="text-muted-foreground uppercase tracking-wide cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.rank || '—'}
            </div>
            <div 
              className="text-foreground cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.role || '—'}
            </div>
            <div 
              className="text-foreground cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.specialty || '—'}
            </div>
            <div 
              className="text-foreground cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.assignedUnit || '—'}
            </div>
            <div 
              className="text-foreground cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.secondment || '—'}
            </div>
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              {isGM && onStatusChange ? (
                <Select 
                  value={person.status} 
                  onValueChange={(value) => onStatusChange(person.id, value as Personnel['status'])}
                >
                  <SelectTrigger className={`h-6 w-[85px] text-[0.65rem] uppercase tracking-wider border ${statusColors[person.status]} px-1.5 py-0 flex items-center justify-center [&_svg]:hidden`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="wia">WIA</SelectItem>
                    <SelectItem value="kia">KIA</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={`h-6 w-[85px] flex items-center justify-center text-[0.65rem] uppercase tracking-wider border ${statusColors[person.status]}`}>
                  {person.status}
                </Badge>
              )}
            </div>
            <div 
              className="flex items-center justify-end pr-2 cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              <Badge className={`w-[50px] text-[0.65rem] uppercase tracking-wider border h-6 flex items-center justify-center ${
                person.characterType === 'pc' 
                  ? 'bg-primary/20 text-primary border-primary/50' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {person.characterType === 'pc' ? 'PC' : 'NPC'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
