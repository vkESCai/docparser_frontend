import { useState } from 'react'
import { Clock, Trash2, FileText, Image, Search, ChevronRight, AlertCircle } from 'lucide-react'

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function History({ history, onClear, onRemove }) {
  const [query, setQuery] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const filtered = history.filter((r) =>
    r.filename.toLowerCase().includes(query.toLowerCase())
  )

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
        <div className="p-5 rounded-2xl border border-terminal-border bg-terminal-surface mb-4">
          <Clock className="w-10 h-10 text-terminal-muted" />
        </div>
        <p className="font-display font-semibold text-terminal-text text-lg">No parse history yet</p>
        <p className="font-mono text-terminal-muted text-sm mt-2">
          Uploaded documents will appear here after parsing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-muted pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history…"
            className="w-full bg-terminal-surface border border-terminal-border rounded-xl pl-9 pr-4 py-2.5 font-mono text-sm text-terminal-text placeholder-terminal-muted focus:outline-none focus:border-terminal-accent/50 transition-colors"
          />
        </div>

        {confirmClear ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClear(); setConfirmClear(false) }}
              className="font-mono text-xs px-3 py-2 rounded-lg bg-terminal-red/10 text-terminal-red border border-terminal-red/30 hover:bg-terminal-red/20 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="font-mono text-xs px-3 py-2 rounded-lg border border-terminal-border text-terminal-muted hover:bg-terminal-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            className="font-mono text-xs px-3 py-2.5 rounded-xl border border-terminal-border text-terminal-muted hover:border-terminal-red/40 hover:text-terminal-red transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Parsed', value: history.length },
          { label: 'PDFs', value: history.filter((r) => r.document_type === 'pdf').length },
          { label: 'Images (OCR)', value: history.filter((r) => r.document_type === 'image').length },
        ].map(({ label, value }) => (
          <div key={label} className="terminal-border rounded-xl border border-terminal-border p-3 text-center">
            <p className="font-mono text-xs text-terminal-muted">{label}</p>
            <p className="font-display font-bold text-xl text-terminal-accent mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex items-center gap-2 py-8 justify-center text-terminal-muted font-mono text-sm">
          <AlertCircle className="w-4 h-4" />
          No results for "{query}"
        </div>
      ) : (
        <div className="terminal-border rounded-xl border border-terminal-border overflow-hidden divide-y divide-terminal-border/50">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-terminal-surface/50 transition-colors group"
            >
              <div className={`p-2 rounded-lg border ${record.document_type === 'pdf'
                ? 'border-terminal-accent/20 bg-terminal-accent/5'
                : 'border-terminal-green/20 bg-terminal-green/5'}`}>
                {record.document_type === 'pdf'
                  ? <FileText className="w-4 h-4 text-terminal-accent" />
                  : <Image className="w-4 h-4 text-terminal-green" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-terminal-text truncate">{record.filename}</p>
                <div className="flex items-center gap-3 mt-0.5 font-mono text-xs text-terminal-muted">
                  <span>{formatDate(record.parsedAt)}</span>
                  <span>·</span>
                  <span>{formatSize(record.file_size)}</span>
                  <span>·</span>
                  <span>{record.summary?.total_words?.toLocaleString()} words</span>
                  {record.summary?.tables_found > 0 && (
                    <><span>·</span><span>{record.summary.tables_found} tables</span></>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-xs text-terminal-muted">
                  {record.processing_time_seconds}s
                </span>
                <button
                  onClick={() => onRemove(record.id)}
                  className="p-1.5 rounded-lg hover:bg-terminal-red/10 hover:text-terminal-red text-terminal-muted transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
