import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, UserGear, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import { PersonnelRosterList } from '@/components/PersonnelRosterList'
import { PersonnelForm } from '@/components/PersonnelForm'
import { PersonnelDetails } from '@/components/PersonnelDetails'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { EmptyState } from '@/components/EmptyState'
import type { Personnel, PersonnelFormData, UserRole } from '@/lib/types'

function App() {
  const [personnel, setPersonnel] = useKV<Personnel[]>('imperial-roster', [])
  const [userRole, setUserRole] = useKV<UserRole>('user-role', 'player')
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isGM = userRole === 'gm'

  const toggleRole = () => {
    setUserRole(currentRole => currentRole === 'gm' ? 'player' : 'gm')
    toast.success(`Switched to ${userRole === 'gm' ? 'Player' : 'GM'} mode`, {
      description: userRole === 'gm' ? 'View-only access' : 'Full editing access'
    })
  }

  const handleAdd = () => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can add personnel' })
      return
    }
    setEditingPersonnel(undefined)
    setFormOpen(true)
  }

  const handleEdit = (person: Personnel) => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can edit personnel' })
      return
    }
    setEditingPersonnel(person)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!isGM) {
      toast.error('Access denied', { description: 'Only GMs can delete personnel' })
      return
    }
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-primary">
                Imperial Personnel Database
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Sith Empire Military Unit — Classified Access
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleRole}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 font-semibold uppercase tracking-wide"
              >
                {isGM ? (
                  <>
                    <UserGear size={20} className="mr-2" />
                    <span className="hidden sm:inline">GM Mode</span>
                    <span className="sm:hidden">GM</span>
                  </>
                ) : (
                  <>
                    <User size={20} className="mr-2" />
                    <span className="hidden sm:inline">Player Mode</span>
                    <span className="sm:hidden">Player</span>
                  </>
                )}
              </Button>
              {isGM && (
                <Button
                  onClick={handleAdd}
                  className="bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
                >
                  <Plus size={20} className="mr-2" />
                  <span className="hidden sm:inline">Add Personnel</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rosterList.length === 0 ? (
          <EmptyState onAddClick={handleAdd} isGM={isGM} />
        ) : (
          <PersonnelRosterList 
            personnel={rosterList} 
            onRowClick={handleCardClick}
          />
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
        isGM={isGM}
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