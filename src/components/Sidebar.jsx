import { Cpu, Layers, Zap, Database, FileSearch, GitBranch } from 'lucide-react'

const SKILLS = [
  {
    icon: Layers,
    name: 'React 18',
    tag: 'FRONTEND',
    color: 'accent',
    desc: 'Component-driven UI with hooks and context',
  },
  {
    icon: Cpu,
    name: 'Tailwind CSS',
    tag: 'STYLING',
    color: 'green',
    desc: 'Utility-first responsive design system',
  },
  {
    icon: Zap,
    name: 'FastAPI',
    tag: 'BACKEND',
    color: 'amber',
    desc: 'High-performance async Python API server',
  },
  {
    icon: FileSearch,
    name: 'pdfplumber',
    tag: 'PARSING',
    color: 'red',
    desc: 'PDF text and table extraction engine',
  },
  {
    icon: Database,
    name: 'Tesseract OCR',
    tag: 'OCR',
    color: 'accent',
    desc: 'Optical character recognition for scans',
  },
  {
    icon: GitBranch,
    name: 'Vite',
    tag: 'TOOLING',
    color: 'green',
    desc: 'Lightning-fast frontend build tool',
  },
]

const colorMap = {
  accent: {
    border: 'border-terminal-accent/20',
    bg: 'bg-terminal-accent/5',
    text: 'text-terminal-accent',
    dot: 'bg-terminal-accent',
  },
  green: {
    border: 'border-terminal-green/20',
    bg: 'bg-terminal-green/5',
    text: 'text-terminal-green',
    dot: 'bg-terminal-green',
  },
  amber: {
    border: 'border-terminal-amber/20',
    bg: 'bg-terminal-amber/5',
    text: 'text-terminal-amber',
    dot: 'bg-terminal-amber',
  },
  red: {
    border: 'border-terminal-red/20',
    bg: 'bg-terminal-red/5',
    text: 'text-terminal-red',
    dot: 'bg-terminal-red',
  },
}

function SkillCard({ icon: Icon, name, tag, color, desc }) {
  const c = colorMap[color]
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-terminal-surface border ${c.border}`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${c.border} ${c.text} uppercase tracking-wider`}>
          {tag}
        </span>
      </div>
      <p className={`font-display font-semibold text-sm ${c.text} mt-2`}>{name}</p>
      <p className="font-mono text-terminal-muted text-xs mt-1 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function Sidebar({ apiStatus }) {
  return (
    <aside className="space-y-5">
      {/* API Status */}
      <div className={`terminal-border rounded-xl border p-4 ${
        apiStatus === 'online'
          ? 'border-terminal-green/30 bg-terminal-green/5'
          : apiStatus === 'offline'
          ? 'border-terminal-red/30 bg-terminal-red/5'
          : 'border-terminal-border bg-terminal-surface'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              apiStatus === 'online' ? 'bg-terminal-green animate-pulse' :
              apiStatus === 'offline' ? 'bg-terminal-red' :
              'bg-terminal-muted animate-pulse'
            }`} />
            <span className="font-mono text-xs uppercase tracking-wider text-terminal-muted">
              FastAPI Backend
            </span>
          </div>
          <span className={`font-mono text-xs font-semibold ${
            apiStatus === 'online' ? 'text-terminal-green' :
            apiStatus === 'offline' ? 'text-terminal-red' :
            'text-terminal-muted'
          }`}>
            {apiStatus === 'online' ? '● ONLINE' : apiStatus === 'offline' ? '○ OFFLINE' : '◌ CHECKING'}
          </span>
        </div>
        <p className="font-mono text-terminal-muted text-xs mt-2">
          localhost:8000 · /parse endpoint
        </p>
      </div>

      {/* Tech Stack */}
      <div>
        <p className="font-mono text-[10px] text-terminal-muted uppercase tracking-widest mb-3 px-1">
          Tech Stack
        </p>
        <div className="grid grid-cols-1 gap-2">
          {SKILLS.map((skill) => (
            <SkillCard key={skill.name} {...skill} />
          ))}
        </div>
      </div>

      {/* Pipeline Info */}
      <div className="terminal-border rounded-xl border border-terminal-border p-4 space-y-3">
        <p className="font-mono text-[10px] text-terminal-muted uppercase tracking-widest">Pipeline Flow</p>
        <div className="space-y-2">
          {[
            { step: '01', label: 'Upload', desc: 'File validation & type detection' },
            { step: '02', label: 'Extract', desc: 'Text, tables, layout analysis' },
            { step: '03', label: 'Detect', desc: 'Entity & pattern recognition' },
            { step: '04', label: 'Return', desc: 'Structured JSON response' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex gap-3 items-start">
              <span className="font-mono text-[10px] text-terminal-accent mt-0.5 shrink-0">{step}</span>
              <div>
                <p className="font-mono text-xs text-terminal-text">{label}</p>
                <p className="font-mono text-[10px] text-terminal-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
