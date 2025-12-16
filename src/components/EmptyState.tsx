import { UserCircle } from '@phosphor-icons/react'

export function EmptyState({ onAddClick, isGM }: { onAddClick: () => void; isGM: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <UserCircle className="relative text-primary" size={80} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 uppercase tracking-wide">
        NO PERSONNEL RECORDS FOUND
      </h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        {isGM 
          ? 'Imperial database contains zero personnel entries. Initialize first record to begin roster management.'
          : 'Imperial database contains zero personnel entries. Contact your GM to add personnel records.'}
      </p>
      {isGM && (
        <button
          onClick={onAddClick}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-sm hover:bg-accent transition-colors"
        >
          Initialize Personnel Record
        </button>
      )}
    </div>
  )
}
