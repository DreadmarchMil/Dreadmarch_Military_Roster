import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const bootSequence = [
    { text: 'DREADMARCH MILITARY NETWORK', delay: 400 },
    { text: 'PERSONNEL DATABASE MANAGEMENT SYSTEM v3.7.2', delay: 300 },
    { text: '', delay: 200 },
    { text: 'Initializing secure connection...', delay: 600 },
    { text: '> Establishing encrypted channel... OK', delay: 400 },
    { text: '> Authenticating Imperial credentials... OK', delay: 500 },
    { text: '> Loading personnel registry... OK', delay: 450 },
    { text: '> Synchronizing unit hierarchies... OK', delay: 400 },
    { text: '> Verifying security clearance... OK', delay: 500 },
    { text: '', delay: 300 },
    { text: 'SYSTEM READY', delay: 600 },
    { text: 'ACCESS GRANTED - CLASSIFIED PERSONNEL DATABASE', delay: 800 },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < bootSequence.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setTimeout(() => {
          onComplete()
        }, bootSequence[currentStep].delay)
      }
    }, bootSequence[currentStep].delay)

    return () => clearTimeout(timer)
  }, [currentStep, onComplete])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-background z-50 flex items-center justify-center"
      >
        <div className="w-full max-w-3xl px-8">
          <div className="font-mono text-sm space-y-1">
            {bootSequence.slice(0, currentStep + 1).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className={`${
                  index === 0 
                    ? 'text-primary font-bold text-lg mb-1' 
                    : index === 1 
                    ? 'text-accent text-xs mb-3'
                    : index === bootSequence.length - 2
                    ? 'text-accent font-bold text-base mt-2'
                    : index === bootSequence.length - 1
                    ? 'text-primary font-bold'
                    : step.text.startsWith('>')
                    ? 'text-foreground pl-2'
                    : 'text-muted-foreground'
                }`}
              >
                {step.text}
                {index === currentStep && step.text && showCursor && (
                  <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: currentStep === bootSequence.length - 1 ? 1 : (currentStep / bootSequence.length) 
            }}
            transition={{ duration: 0.2 }}
            className="h-1 bg-primary/30 mt-8 origin-left"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
