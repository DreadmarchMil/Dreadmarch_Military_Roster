import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Personnel } from '@/lib/types'

interface PersonnelRosterListProps {
  personnel: Personnel[]
  onRowClick: (personnel: Personnel) => void
  onStatusChange?: (id: string, status: Personnel['status']) => void
  isGM?: boolean
}

export function PersonnelRosterList({ personnel, onRowClick, onStatusChange, isGM }: PersonnelRosterListProps) {
  const statusColors = {
    available: 'bg-accent/20 text-accent border-accent/30',
    deployed: 'bg-primary/20 text-primary border-primary/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    wia: 'bg-secondary text-secondary-foreground border-secondary',
    kia: 'bg-destructive/20 text-destructive border-destructive/30'
  }

  return (
    <div className="border border-border bg-card text-sm">
      <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr_1.5fr_1.2fr_0.8fr] gap-3 px-6 py-3 bg-primary/10 border-b-2 border-primary/30 text-xs font-bold uppercase tracking-wider text-primary">
        <div>Name</div>
        <div>Callsign</div>
        <div>Rank</div>
        <div>Assigned Unit</div>
        <div>Specialty</div>
        <div>Status</div>
        <div className="text-right pr-2">Type</div>
      </div>

      <div className="divide-y divide-border/50">
        {personnel.map((person) => (
          <div
            key={person.id}
            className="grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr_1.5fr_1.2fr_0.8fr] gap-3 px-6 py-3 hover:bg-primary/5 transition-colors group items-center"
          >
            <div 
              className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.name}
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
              {person.assignedUnit || '—'}
            </div>
            <div 
              className="text-foreground cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              {person.specialty || '—'}
            </div>
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              {isGM && onStatusChange ? (
                <Select 
                  value={person.status} 
                  onValueChange={(value) => onStatusChange(person.id, value as Personnel['status'])}
                >
                  <SelectTrigger className={`h-7 text-xs uppercase tracking-wider border ${statusColors[person.status]} px-2 py-0`}>
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
                <Badge className={`text-xs uppercase tracking-wider border ${statusColors[person.status]}`}>
                  {person.status}
                </Badge>
              )}
            </div>
            <div 
              className="flex items-center justify-end pr-2 cursor-pointer"
              onClick={() => onRowClick(person)}
            >
              <Badge className={`text-xs uppercase tracking-wider border h-7 flex items-center ${
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
