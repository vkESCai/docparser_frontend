import { ScanLine, Upload, Files, Clock, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'single', label: 'Single', icon: Upload },
  { id: 'batch', label: 'Batch', icon: Files },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'docs', label: 'API Docs', icon: BookOpen, href: 'http://localhost:8000/docs' },
]

export default function Navbar({ page, onNav, historyCount }) {
  return (
    <header className="border-b border-terminal-border bg-terminal-surface/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-terminal-accent/10 border border-terminal-accent/20">
            <ScanLine className="w-5 h-5 text-terminal-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-terminal-text tracking-tight leading-none">
              Doc<span className="text-terminal-accent">Parser</span>
            </h1>
            <p className="font-mono text-[9px] text-terminal-muted uppercase tracking-widest mt-0.5">
              Intelligence Pipeline
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 bg-terminal-bg rounded-xl p-1 border border-terminal-border">
          {NAV_ITEMS.map(({ id, label, icon: Icon, href }) =>
            href ? (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs text-terminal-muted hover:text-terminal-accent transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                {label} ↗
              </a>
            ) : (
              <button
                key={id}
                onClick={() => onNav(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs transition-all duration-200 relative ${
                  page === id
                    ? 'bg-terminal-accent text-terminal-bg font-semibold'
                    : 'text-terminal-muted hover:text-terminal-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {id === 'history' && historyCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-bold
                    ${page === 'history' ? 'bg-terminal-bg text-terminal-accent' : 'bg-terminal-accent text-terminal-bg'}`}>
                    {historyCount > 9 ? '9+' : historyCount}
                  </span>
                )}
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  )
}
