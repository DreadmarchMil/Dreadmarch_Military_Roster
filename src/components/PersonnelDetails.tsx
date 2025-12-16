import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash, User, Robot } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { Personnel } from '@/lib/types'

interface PersonnelDetailsProps {
  personnel: Personnel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (personnel: Personnel) => void
  onDelete: (id: string) => void
  onToggleCharacterType: (id: string, newType: 'pc' | 'npc') => void
  onStatusChange?: (id: string, status: Personnel['status']) => void
  isGM: boolean
}

export function PersonnelDetails({ personnel, open, onOpenChange, onEdit, onDelete, onToggleCharacterType, onStatusChange, isGM }: PersonnelDetailsProps) {
  if (!personnel) return null

  const statusColors = {
    available: 'bg-accent/20 text-accent border-accent/30',
    deployed: 'bg-primary/20 text-primary border-primary/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    wia: 'bg-secondary text-secondary-foreground border-secondary',
    kia: 'bg-destructive/20 text-destructive border-destructive/30'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card border-l-2 border-primary/30 w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold uppercase tracking-wider text-primary">
            PERSONNEL FILE
          </SheetTitle>
          <div className="h-px bg-primary/30 mt-2" />
        </SheetHeader>

        <div className="space-y-4 mt-1">
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1.5">{personnel.name}</h2>
              <div className="flex items-center gap-2">
                {isGM && onStatusChange ? (
                  <Select 
                    value={personnel.status} 
                    onValueChange={(value) => onStatusChange(personnel.id, value as Personnel['status'])}
                  >
                    <SelectTrigger className={`h-7 w-[88px] text-xs uppercase tracking-wider border ${statusColors[personnel.status]} px-2 [&_svg]:hidden`}>
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
                  <Badge className={`h-7 flex items-center text-xs uppercase tracking-wider border w-[88px] justify-center ${statusColors[personnel.status]}`}>
                    {personnel.status}
                  </Badge>
                )}
                {isGM ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const newType = personnel.characterType === 'pc' ? 'npc' : 'pc'
                      onToggleCharacterType(personnel.id, newType)
                    }}
                    className={`h-7 w-[88px] px-2 text-xs uppercase tracking-wider border transition-colors ${
                      personnel.characterType === 'pc' 
                        ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30' 
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    }`}
                  >
                    {personnel.characterType === 'pc' ? (
                      <>
                        <User size={14} className="mr-1" weight="bold" />
                        PC
                      </>
                    ) : (
                      <>
                        <Robot size={14} className="mr-1" weight="bold" />
                        NPC
                      </>
                    )}
                  </Button>
                ) : (
                  <Badge className={`h-7 w-[88px] flex items-center justify-center text-xs uppercase tracking-wider border ${
                    personnel.characterType === 'pc' 
                      ? 'bg-primary/20 text-primary border-primary/50' 
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {personnel.characterType === 'pc' ? 'PC' : 'NPC'}
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Rank</div>
                  <div className="text-sm text-foreground">{personnel.rank || '—'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Callsign</div>
                  <div className="text-sm text-foreground">{personnel.callsign || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Assigned Unit</div>
                  <div className="text-sm text-foreground">{personnel.assignedUnit || '—'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Secondment</div>
                  <div className="text-sm text-foreground">{personnel.secondment || '—'}</div>
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

          {isGM && (
            <>
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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
