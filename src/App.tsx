import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import { PersonnelCard } from '@/components/PersonnelCard'
import { PersonnelForm } from '@/components/PersonnelForm'
import { PersonnelDetails } from '@/components/PersonnelDetails'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { EmptyState } from '@/components/EmptyState'
import type { Personnel, PersonnelFormData } from '@/lib/types'

function App() {
  const [personnel, setPersonnel] = useKV<Personnel[]>('imperial-roster', [])
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingPersonnel(undefined)
    setFormOpen(true)
  }

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    const person = personnel?.find(p => p.id === id)
    if (person) {
      setDeletingId(id)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDelete = () => {
    if (deletingId) {
      const person = personnel?.find(p => p.id === deletingId)
      setPersonnel(currentPersonnel => (currentPersonnel || []).filter(p => p.id !== deletingId))
      toast.success('Personnel record deleted', {
        description: person ? `${person.name} removed from database` : 'Record removed'
      })
      setDeletingId(null)
    }
  }

  const handleSubmit = (data: PersonnelFormData) => {
    if (editingPersonnel) {
      setPersonnel(currentPersonnel =>
        (currentPersonnel || []).map(p =>
          p.id === editingPersonnel.id ? { ...data, id: editingPersonnel.id } : p
        )
      )
      toast.success('Personnel record updated', {
        description: `${data.name} has been updated`
      })
    } else {
      const newPersonnel: Personnel = {
        ...data,
        id: Date.now().toString()
      }
      setPersonnel(currentPersonnel => [...(currentPersonnel || []), newPersonnel])
      toast.success('Personnel record created', {
        description: `${data.name} added to database`
      })
    }
  }

  const handleCardClick = (person: Personnel) => {
    setSelectedPersonnel(person)
    setDetailsOpen(true)
  }

  const deletingPersonnel = personnel?.find(p => p.id === deletingId)
  const rosterList = personnel || []

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: 'oklch(0.18 0.01 25)',
            border: '1px solid oklch(0.3 0.05 25)',
            color: 'oklch(0.85 0.01 25)',
          },
        }}
      />
      
      <div className="border-b-2 border-primary/30 bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
                Imperial Personnel Database
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Sith Empire Military Unit — Classified Access
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
            >
              <Plus size={20} className="mr-2" />
              <span className="hidden sm:inline">Add Personnel</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rosterList.length === 0 ? (
          <EmptyState onAddClick={handleAdd} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rosterList.map((person) => (
              <PersonnelCard
                key={person.id}
                personnel={person}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </main>

      <PersonnelForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        personnel={editingPersonnel}
      />

      <PersonnelDetails
        personnel={selectedPersonnel}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DeleteConfirmation
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        personnelName={deletingPersonnel?.name || ''}
      />
    </div>
  )
}

export default App