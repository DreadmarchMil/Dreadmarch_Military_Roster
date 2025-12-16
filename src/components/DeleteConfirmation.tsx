import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  personnelName: string
}

export function DeleteConfirmation({ open, onOpenChange, onConfirm, personnelName }: DeleteConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-2 border-destructive/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold uppercase tracking-wider text-destructive">
            CONFIRM PERSONNEL DELETION
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80 pt-2">
            You are about to permanently remove <span className="font-semibold text-foreground">{personnelName}</span> from the Imperial personnel database.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border hover:bg-muted uppercase tracking-wide font-semibold">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 uppercase tracking-wide font-semibold"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
