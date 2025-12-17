import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-primary text-xl font-mono uppercase tracking-wider animate-pulse"
        >
          Loading Personnel Database...
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-sm mt-4 font-mono"
        >
          Synchronizing Imperial records...
        </motion.div>
      </div>
    </div>
  )
}
