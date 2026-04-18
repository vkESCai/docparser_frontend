import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 'upload', label: 'Uploading file', desc: 'Transferring bytes to server' },
  { id: 'validate', label: 'Validating type', desc: 'PDF or image detection' },
  { id: 'extract', label: 'Extracting content', desc: 'Text, layout & structure' },
  { id: 'tables', label: 'Detecting tables', desc: 'Row/column recognition' },
  { id: 'entities', label: 'Scanning entities', desc: 'Amounts, dates, accounts' },
  { id: 'done', label: 'Finalizing', desc: 'Building JSON response' },
]

export default function ParseProgress({ status, uploadProgress }) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (status === 'idle') { setActiveStep(0); return }
    if (status === 'uploading') {
      const pct = uploadProgress || 0
      setActiveStep(pct < 100 ? 0 : 1)
      return
    }
    if (status === 'parsing') {
      let step = 1
      const iv = setInterval(() => {
        step = Math.min(step + 1, STEPS.length - 1)
        setActiveStep(step)
        if (step >= STEPS.length - 1) clearInterval(iv)
      }, 600)
      return () => clearInterval(iv)
    }
    if (status === 'done') setActiveStep(STEPS.length)
  }, [status, uploadProgress])

  if (status === 'idle') return null

  return (
    <div className="terminal-border rounded-xl border border-terminal-accent/30 bg-terminal-accent/5 p-5 animate-fadeIn">
      <div className="flex items-center gap-2 mb-5">
        {status !== 'done' ? (
          <Loader2 className="w-4 h-4 text-terminal-accent animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-terminal-green" />
        )}
        <span className="font-mono text-sm text-terminal-accent uppercase tracking-wider">
          {status === 'uploading' ? `Uploading… ${uploadProgress}%`
            : status === 'parsing' ? 'Pipeline running'
            : 'Pipeline complete'}
        </span>
      </div>

      {/* Upload progress bar */}
      {status === 'uploading' && (
        <div className="mb-4">
          <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-fill rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const done = i < activeStep
          const active = i === activeStep && status !== 'done'
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="shrink-0">
                {done || status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-terminal-green" />
                ) : active ? (
                  <Loader2 className="w-4 h-4 text-terminal-accent animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-terminal-border" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-mono text-xs ${
                  done || status === 'done' ? 'text-terminal-green'
                    : active ? 'text-terminal-accent'
                    : 'text-terminal-muted'
                }`}>
                  {step.label}
                </span>
                {active && (
                  <span className="font-mono text-xs text-terminal-muted ml-2">— {step.desc}</span>
                )}
              </div>
              {(done || status === 'done') && (
                <span className="font-mono text-[10px] text-terminal-green/60">✓</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
