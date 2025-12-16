import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash } from '@phosphor-icons/react'
import type { Personnel } from '@/lib/types'

interface PersonnelCardProps {
  personnel: Personnel
  onEdit: (personnel: Personnel) => void
  onDelete: (id: string) => void
  onClick: (personnel: Personnel) => void
}

export function PersonnelCard({ personnel, onEdit, onDelete, onClick }: PersonnelCardProps) {
  const statusColors = {
    active: 'bg-accent/20 text-accent border-accent/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    kia: 'bg-destructive/20 text-destructive border-destructive/30',
    mia: 'bg-secondary text-secondary-foreground border-secondary'
  }

  return (
    <Card 
      className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
      onClick={() => onClick(personnel)}
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate mb-1">
              {personnel.name}
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {personnel.rank}
            </p>
          </div>
          <Badge className={`ml-2 text-xs uppercase tracking-wider border ${statusColors[personnel.status]}`}>
            {personnel.status}
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <div className="text-sm">
            <span className="text-muted-foreground">ROLE:</span>{' '}
            <span className="text-foreground">{personnel.role}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">SPECIES:</span>{' '}
            <span className="text-foreground">{personnel.species}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(personnel)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Pencil size={16} />
            Edit
          </button>
          <div className="w-px h-6 bg-border/50" />
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(personnel.id)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash size={16} />
            Delete
          </button>
        </div>
      </div>
    </Card>
  )
}
