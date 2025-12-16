import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Personnel, PersonnelFormData, Unit } from '@/lib/types'

interface PersonnelFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PersonnelFormData) => void
  personnel?: Personnel
  units: Unit[]
}

export function PersonnelForm({ open, onOpenChange, onSubmit, personnel, units }: PersonnelFormProps) {
  const [formData, setFormData] = useState<PersonnelFormData>({
    name: '',
    callsign: '',
    rank: '',
    role: '',
    specialty: '',
    species: '',
    primaryUnit: '',
    detachment: '',
    status: 'available',
    notes: ''
  })

  useEffect(() => {
    if (personnel) {
      setFormData({
        name: personnel.name,
        callsign: personnel.callsign,
        rank: personnel.rank,
        role: personnel.role,
        specialty: personnel.specialty,
        species: personnel.species,
        primaryUnit: personnel.primaryUnit,
        detachment: personnel.detachment,
        status: personnel.status,
        notes: personnel.notes
      })
    } else {
      setFormData({
        name: '',
        callsign: '',
        rank: '',
        role: '',
        specialty: '',
        species: '',
        primaryUnit: '',
        detachment: '',
        status: 'available',
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
              <Label htmlFor="callsign" className="text-xs uppercase tracking-wide text-muted-foreground">
                Callsign
              </Label>
              <Input
                id="callsign"
                value={formData.callsign}
                onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                className="bg-background border-input focus:border-ring focus:ring-ring"
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'available' | 'deployed' | 'inactive' | 'wia' | 'kia') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status" className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="available">AVAILABLE</SelectItem>
                <SelectItem value="deployed">DEPLOYED</SelectItem>
                <SelectItem value="inactive">INACTIVE</SelectItem>
                <SelectItem value="wia">WIA</SelectItem>
                <SelectItem value="kia">KIA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs uppercase tracking-wide text-muted-foreground">
              Role
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="bg-background border-input focus:border-ring focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-xs uppercase tracking-wide text-muted-foreground">
              Specialty
            </Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="bg-background border-input focus:border-ring focus:ring-ring"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryUnit" className="text-xs uppercase tracking-wide text-muted-foreground">
                Primary Unit
              </Label>
              <Select
                value={formData.primaryUnit}
                onValueChange={(value) => setFormData({ ...formData, primaryUnit: value })}
              >
                <SelectTrigger id="primaryUnit" className="bg-background border-input">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detachment" className="text-xs uppercase tracking-wide text-muted-foreground">
                Detachment
              </Label>
              <Input
                id="detachment"
                value={formData.detachment}
                onChange={(e) => setFormData({ ...formData, detachment: e.target.value })}
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
