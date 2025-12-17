import { WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  const connectedColor = 'oklch(0.65 0.20 145)' // Green color for connected state
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/30 bg-card/80 text-xs font-semibold uppercase tracking-wide">
          {isConnected ? (
            <>
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: connectedColor }} />
              <WifiHigh size={16} style={{ color: connectedColor }} />
              <span className="hidden sm:inline" style={{ color: connectedColor }}>Connected</span>
            </>
          ) : (
            <>
              <div className="size-2 rounded-full bg-accent animate-pulse" />
              <WifiSlash size={16} className="text-accent" />
              <span className="hidden sm:inline text-accent">Local Only</span>
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {isConnected ? (
          <p className="max-w-xs">
            <strong>Real-time sync active</strong>
            <br />
            Changes sync across all devices
          </p>
        ) : (
          <p className="max-w-xs">
            <strong>Running in local mode</strong>
            <br />
            Data stored in this browser only
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
