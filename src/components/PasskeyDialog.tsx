import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LockKey, Eye, EyeSlash } from '@phosphor-icons/react'

interface PasskeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PasskeyDialog({ open, onOpenChange, onSuccess }: PasskeyDialogProps) {
  const [storedPasskey, setStoredPasskey] = useKV<string>('gm-passkey', '')
  const [inputPasskey, setInputPasskey] = useState('')
  const [confirmPasskey, setConfirmPasskey] = useState('')
  const [error, setError] = useState('')
  const [showPasskey, setShowPasskey] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isFirstTime = !storedPasskey

  useEffect(() => {
    if (!open) {
      setInputPasskey('')
      setConfirmPasskey('')
      setError('')
      setShowPasskey(false)
      setShowConfirm(false)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isFirstTime) {
      if (!inputPasskey.trim()) {
        setError('Passkey cannot be empty')
        return
      }
      if (inputPasskey !== confirmPasskey) {
        setError('Passkeys do not match')
        return
      }
      setStoredPasskey(inputPasskey)
      onSuccess()
      onOpenChange(false)
    } else {
      if (inputPasskey === storedPasskey) {
        onSuccess()
        onOpenChange(false)
      } else {
        setError('Incorrect passkey')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary uppercase tracking-wider">
            <LockKey size={24} />
            {isFirstTime ? 'Set GM Passkey' : 'Enter GM Passkey'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isFirstTime 
              ? 'Create a passkey to secure GM access. This will be required to enter GM mode.'
              : 'Enter your GM passkey to access administrative functions.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passkey" className="uppercase tracking-wide text-xs">
              {isFirstTime ? 'Create Passkey' : 'Passkey'}
            </Label>
            <div className="relative">
              <Input
                id="passkey"
                type={showPasskey ? 'text' : 'password'}
                value={inputPasskey}
                onChange={(e) => setInputPasskey(e.target.value)}
                className="pr-10 bg-background border-border"
                placeholder={isFirstTime ? 'Enter a passkey' : 'Enter passkey'}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasskey ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isFirstTime && (
            <div className="space-y-2">
              <Label htmlFor="confirm-passkey" className="uppercase tracking-wide text-xs">
                Confirm Passkey
              </Label>
              <div className="relative">
                <Input
                  id="confirm-passkey"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  className="pr-10 bg-background border-border"
                  placeholder="Re-enter passkey"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/30 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-primary/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent uppercase tracking-wide"
            >
              {isFirstTime ? 'Set Passkey' : 'Unlock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
