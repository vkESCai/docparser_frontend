import { useState } from 'react'
import { Download, FileJson, FileText, Table2, CheckCheck } from 'lucide-react'

function toCSV(tables) {
  if (!tables || tables.length === 0) return 'No tables found'
  return tables
    .map((t, i) => {
      const header = (t.headers || []).join(',')
      const rows = (t.rows || []).map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
      return `# Table ${i + 1}\n${header}\n${rows}`
    })
    .join('\n\n')
}

function toPlainText(extraction) {
  return (extraction.pages || [])
    .map((p) => `--- Page ${p.page_number} ---\n${p.text}`)
    .join('\n\n')
}

export default function ExportPanel({ result }) {
  const [copied, setCopied] = useState(null)

  if (!result) return null

  const triggerDownload = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const base = result.filename?.replace(/\.[^.]+$/, '') || 'document'

  const exports = [
    {
      id: 'json',
      icon: FileJson,
      label: 'Full JSON',
      desc: 'Complete parse result with all extracted data',
      color: 'accent',
      action: () =>
        triggerDownload(
          JSON.stringify(result, null, 2),
          `${base}_parsed.json`,
          'application/json'
        ),
    },
    {
      id: 'text',
      icon: FileText,
      label: 'Plain Text',
      desc: 'Extracted text content from all pages',
      color: 'green',
      action: () =>
        triggerDownload(
          toPlainText(result.extraction),
          `${base}_text.txt`,
          'text/plain'
        ),
    },
    {
      id: 'csv',
      icon: Table2,
      label: 'Tables CSV',
      desc: 'All detected tables in CSV format',
      color: 'amber',
      action: () =>
        triggerDownload(
          toCSV(result.extraction?.tables),
          `${base}_tables.csv`,
          'text/csv'
        ),
    },
    {
      id: 'entities',
      icon: FileJson,
      label: 'Entities JSON',
      desc: 'Amounts, dates, account numbers, emails',
      color: 'red',
      action: () =>
        triggerDownload(
          JSON.stringify(result.entities, null, 2),
          `${base}_entities.json`,
          'application/json'
        ),
    },
  ]

  const colorMap = {
    accent: 'border-terminal-accent/30 hover:border-terminal-accent/60 hover:bg-terminal-accent/5 text-terminal-accent',
    green: 'border-terminal-green/30 hover:border-terminal-green/60 hover:bg-terminal-green/5 text-terminal-green',
    amber: 'border-terminal-amber/30 hover:border-terminal-amber/60 hover:bg-terminal-amber/5 text-terminal-amber',
    red: 'border-terminal-red/30 hover:border-terminal-red/60 hover:bg-terminal-red/5 text-terminal-red',
  }

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exports.map(({ id, icon: Icon, label, desc, color, action }) => (
          <button
            key={id}
            onClick={action}
            className={`terminal-border rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${colorMap[color]}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" />
              <span className="font-display font-semibold text-sm">{label}</span>
            </div>
            <p className="font-mono text-terminal-muted text-xs leading-relaxed">{desc}</p>
            <div className="flex items-center gap-1.5 mt-3 font-mono text-xs opacity-70">
              <Download className="w-3 h-3" />
              Download
            </div>
          </button>
        ))}
      </div>

      {/* Copy full JSON */}
      <button
        onClick={handleCopyJSON}
        className="w-full py-3 rounded-xl border border-terminal-border hover:border-terminal-accent/40 font-mono text-xs uppercase tracking-wider text-terminal-muted hover:text-terminal-accent transition-all flex items-center justify-center gap-2"
      >
        {copied ? (
          <><CheckCheck className="w-3.5 h-3.5 text-terminal-green" /><span className="text-terminal-green">COPIED TO CLIPBOARD</span></>
        ) : (
          <><FileJson className="w-3.5 h-3.5" />COPY FULL JSON</>
        )}
      </button>
    </div>
  )
}
