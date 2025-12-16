import { Badge } from '@/components/ui/badge'
import type { Personnel } from '@/lib/types'

interface PersonnelRosterListProps {
  personnel: Personnel[]
  onRowClick: (personnel: Personnel) => void
}

export function PersonnelRosterList({ personnel, onRowClick }: PersonnelRosterListProps) {
  const statusColors = {
    available: 'bg-accent/20 text-accent border-accent/30',
    deployed: 'bg-primary/20 text-primary border-primary/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    wia: 'bg-secondary text-secondary-foreground border-secondary',
    kia: 'bg-destructive/20 text-destructive border-destructive/30'
  }

  return (
    <div className="border border-border bg-card">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-primary/10 border-b-2 border-primary/30 text-xs font-bold uppercase tracking-wider text-primary">
        <div className="col-span-12 sm:col-span-3">Name</div>
        <div className="hidden sm:block sm:col-span-1">Type</div>
        <div className="hidden sm:block sm:col-span-2">Callsign</div>
        <div className="hidden md:block md:col-span-2">Rank</div>
        <div className="hidden lg:block lg:col-span-2">Assigned Unit</div>
        <div className="hidden xl:block xl:col-span-1">Specialty</div>
        <div className="hidden sm:block sm:col-span-1">Status</div>
      </div>

      <div className="divide-y divide-border/50">
        {personnel.map((person) => (
          <div
            key={person.id}
            onClick={() => onRowClick(person)}
            className="grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer hover:bg-primary/5 transition-colors group"
          >
            <div className="col-span-12 sm:col-span-3 font-semibold text-foreground group-hover:text-primary transition-colors">
              {person.name}
            </div>
            <div className="hidden sm:flex sm:col-span-1 items-center">
              <Badge className={`text-xs uppercase tracking-wider border ${
                person.characterType === 'pc' 
                  ? 'bg-primary/20 text-primary border-primary/50' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {person.characterType === 'pc' ? 'PC' : 'NPC'}
              </Badge>
            </div>
            <div className="hidden sm:block sm:col-span-2 text-sm text-accent">
              {person.callsign || '—'}
            </div>
            <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground uppercase tracking-wide">
              {person.rank || '—'}
            </div>
            <div className="hidden lg:block lg:col-span-2 text-sm text-foreground">
              {person.assignedUnit || '—'}
            </div>
            <div className="hidden xl:block xl:col-span-1 text-sm text-foreground">
              {person.specialty || '—'}
            </div>
            <div className="hidden sm:flex sm:col-span-1 items-center">
              <Badge className={`text-xs uppercase tracking-wider border ${statusColors[person.status]}`}>
                {person.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
