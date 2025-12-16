import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pencil, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { Personnel } from '@/lib/types'

interface PersonnelDetailsProps {
  personnel: Personnel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (personnel: Personnel) => void
  onDelete: (id: string) => void
}

export function PersonnelDetails({ personnel, open, onOpenChange, onEdit, onDelete }: PersonnelDetailsProps) {
  if (!personnel) return null

  const statusColors = {
    active: 'bg-accent/20 text-accent border-accent/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    kia: 'bg-destructive/20 text-destructive border-destructive/30',
    mia: 'bg-secondary text-secondary-foreground border-secondary'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card border-l-2 border-primary/30 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold uppercase tracking-wider text-primary">
            PERSONNEL FILE
          </SheetTitle>
          <div className="h-px bg-primary/30 mt-2" />
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{personnel.name}</h2>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs uppercase tracking-wider border ${statusColors[personnel.status]}`}>
                  {personnel.status}
                </Badge>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Callsign</div>
                <div className="text-sm text-foreground">{personnel.callsign || '—'}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Rank</div>
                <div className="text-sm text-foreground">{personnel.rank || '—'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Role</div>
                  <div className="text-sm text-foreground">{personnel.role || '—'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Specialty</div>
                  <div className="text-sm text-foreground">{personnel.specialty || '—'}</div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Species</div>
                <div className="text-sm text-foreground">{personnel.species || '—'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Primary Unit</div>
                  <div className="text-sm text-foreground">{personnel.primaryUnit || '—'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Detachment</div>
                  <div className="text-sm text-foreground">{personnel.detachment || '—'}</div>
                </div>
              </div>

              {personnel.notes && (
                <>
                  <Separator className="bg-border/50" />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Notes / Additional Information
                    </div>
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {personnel.notes}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="flex gap-3">
            <Button
              onClick={() => {
                onEdit(personnel)
                onOpenChange(false)
              }}
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
            >
              <Pencil size={16} className="mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => {
                onDelete(personnel.id)
                onOpenChange(false)
              }}
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold uppercase tracking-wide"
            >
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
