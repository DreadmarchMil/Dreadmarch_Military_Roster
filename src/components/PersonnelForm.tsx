import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Personnel, PersonnelFormData } from '@/lib/types'

interface PersonnelFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PersonnelFormData) => void
  personnel?: Personnel
}

export function PersonnelForm({ open, onOpenChange, onSubmit, personnel }: PersonnelFormProps) {
  const [formData, setFormData] = useState<PersonnelFormData>({
    name: '',
    rank: '',
    role: '',
    species: '',
    affiliation: '',
    status: 'active',
    notes: ''
  })

  useEffect(() => {
    if (personnel) {
      setFormData({
        name: personnel.name,
        rank: personnel.rank,
        role: personnel.role,
        species: personnel.species,
        affiliation: personnel.affiliation,
        status: personnel.status,
        notes: personnel.notes
      })
    } else {
      setFormData({
        name: '',
        rank: '',
        role: '',
        species: '',
        affiliation: '',
        status: 'active',
        notes: ''
      })
    }
  }, [personnel, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-primary/30 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-wider text-primary">
            {personnel ? 'MODIFY PERSONNEL RECORD' : 'NEW PERSONNEL ENTRY'}
          </DialogTitle>
          <div className="h-px bg-primary/30 mt-2" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border-input focus:border-ring focus:ring-ring"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rank" className="text-xs uppercase tracking-wide text-muted-foreground">
                Rank
              </Label>
              <Input
                id="rank"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="bg-background border-input focus:border-ring focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'kia' | 'mia') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status" className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="active">ACTIVE</SelectItem>
                  <SelectItem value="inactive">INACTIVE</SelectItem>
                  <SelectItem value="kia">KIA</SelectItem>
                  <SelectItem value="mia">MIA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs uppercase tracking-wide text-muted-foreground">
              Role / Specialization
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="bg-background border-input focus:border-ring focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species" className="text-xs uppercase tracking-wide text-muted-foreground">
                Species
              </Label>
              <Input
                id="species"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="bg-background border-input focus:border-ring focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliation" className="text-xs uppercase tracking-wide text-muted-foreground">
                Affiliation
              </Label>
              <Input
                id="affiliation"
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                className="bg-background border-input focus:border-ring focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs uppercase tracking-wide text-muted-foreground">
              Notes / Additional Information
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-background border-input focus:border-ring focus:ring-ring min-h-24"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border hover:bg-muted"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
            >
              {personnel ? 'UPDATE' : 'CREATE'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
