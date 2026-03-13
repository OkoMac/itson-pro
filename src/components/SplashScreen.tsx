import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  'Initializing secure connection...',
  'Connecting to Omni ERP...',
  'Loading operational event stream...',
  'Synchronizing cost centres...',
  'Verifying user credentials...',
  'System ready.',
];

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentStep < steps.length) {
      const delay = currentStep === steps.length - 1 ? 600 : 400 + Math.random() * 300;
      const timer = setTimeout(() => setCurrentStep(s => s + 1), delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [done, onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'hsl(220, 20%, 5%)' }}
        >
          <div className="text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}>
                <span className="text-xl font-bold" style={{ color: 'hsl(220, 20%, 5%)' }}>IP</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                CLG Operational Intelligence
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Powered by Itson-Pro</p>
            </motion.div>

            {/* Steps */}
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {steps.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={i <= currentStep ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i < currentStep
                        ? 'bg-status-healthy'
                        : i === currentStep
                        ? 'bg-status-active animate-pulse'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-xs font-mono transition-colors ${
                      i < currentStep
                        ? 'text-muted-foreground'
                        : i === currentStep
                        ? 'text-foreground'
                        : 'text-muted'
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6 w-64 mx-auto h-0.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-status-active rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
