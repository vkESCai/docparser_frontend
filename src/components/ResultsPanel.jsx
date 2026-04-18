import { useState } from 'react'
import {
  FileText, Hash, Table2, Search, Clock, Database,
  ChevronDown, ChevronUp, Copy, CheckCheck, AlertCircle
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color = 'accent' }) {
  const colors = {
    accent: 'text-terminal-accent border-terminal-accent/20 bg-terminal-accent/5',
    green: 'text-terminal-green border-terminal-green/20 bg-terminal-green/5',
    amber: 'text-terminal-amber border-terminal-amber/20 bg-terminal-amber/5',
    red: 'text-terminal-red border-terminal-red/20 bg-terminal-red/5',
  }
  return (
    <div className={`terminal-border rounded-xl p-4 border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="font-display font-bold text-2xl">{value}</p>
    </div>
  )
}

function TableViewer({ tables }) {
  const [expanded, setExpanded] = useState(null)
  if (!tables || tables.length === 0)
    return <p className="font-mono text-terminal-muted text-sm">No tables detected in this document.</p>

  return (
    <div className="space-y-3">
      {tables.map((table, i) => (
        <div key={i} className="terminal-border rounded-xl border border-terminal-border overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-terminal-surface/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-terminal-accent" />
              <span className="font-mono text-sm">
                Table {i + 1}
                {table.page && <span className="text-terminal-muted ml-2">· Page {table.page}</span>}
              </span>
              <span className="text-terminal-muted font-mono text-xs">
                {table.rows?.length || 0} rows × {table.headers?.length || 0} cols
              </span>
            </div>
            {expanded === i ? <ChevronUp className="w-4 h-4 text-terminal-muted" /> : <ChevronDown className="w-4 h-4 text-terminal-muted" />}
          </button>

          {expanded === i && (
            <div className="overflow-x-auto border-t border-terminal-border">
              <table className="w-full text-xs font-mono">
                {table.headers && table.headers.length > 0 && (
                  <thead>
                    <tr className="bg-terminal-surface">
                      {table.headers.map((h, j) => (
                        <th key={j} className="px-3 py-2 text-left text-terminal-accent border-r border-terminal-border last:border-r-0">
                          {h || '—'}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {(table.rows || []).slice(0, 50).map((row, j) => (
                    <tr key={j} className={j % 2 === 0 ? 'bg-terminal-bg' : 'bg-terminal-surface/30'}>
                      {(row || []).map((cell, k) => (
                        <td key={k} className="px-3 py-2 text-terminal-text border-r border-terminal-border/50 last:border-r-0 whitespace-nowrap">
                          {cell || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {(table.rows?.length || 0) > 50 && (
                    <tr>
                      <td colSpan={table.headers?.length || 1} className="px-3 py-2 text-terminal-muted text-center">
                        … {table.rows.length - 50} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function EntityBadge({ label, items, color }) {
  if (!items || items.length === 0) return null
  const colorMap = {
    green: 'bg-terminal-green/10 text-terminal-green border-terminal-green/20',
    amber: 'bg-terminal-amber/10 text-terminal-amber border-terminal-amber/20',
    accent: 'bg-terminal-accent/10 text-terminal-accent border-terminal-accent/20',
    red: 'bg-terminal-red/10 text-terminal-red border-terminal-red/20',
  }
  return (
    <div className="space-y-2">
      <p className="font-mono text-xs text-terminal-muted uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={`font-mono text-xs px-2 py-1 rounded border ${colorMap[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function TextViewer({ pages }) {
  const [copiedPage, setCopiedPage] = useState(null)
  const [expandedPage, setExpandedPage] = useState(0)

  const copyText = (text, page) => {
    navigator.clipboard.writeText(text)
    setCopiedPage(page)
    setTimeout(() => setCopiedPage(null), 2000)
  }

  return (
    <div className="space-y-3">
      {pages.map((page, i) => (
        <div key={i} className="terminal-border rounded-xl border border-terminal-border overflow-hidden">
          <button
            onClick={() => setExpandedPage(expandedPage === i ? null : i)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-terminal-surface/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-terminal-accent" />
              <span className="font-mono text-sm">Page {page.page_number}</span>
              <span className="text-terminal-muted font-mono text-xs">{page.char_count} chars</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); copyText(page.text, i) }}
                className="p-1 rounded hover:bg-terminal-border transition-colors"
              >
                {copiedPage === i ? <CheckCheck className="w-3.5 h-3.5 text-terminal-green" /> : <Copy className="w-3.5 h-3.5 text-terminal-muted" />}
              </button>
              {expandedPage === i ? <ChevronUp className="w-4 h-4 text-terminal-muted" /> : <ChevronDown className="w-4 h-4 text-terminal-muted" />}
            </div>
          </button>

          {expandedPage === i && (
            <div className="border-t border-terminal-border bg-terminal-bg p-4">
              {page.text ? (
                <pre className="font-mono text-xs text-terminal-text whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {page.text}
                </pre>
              ) : (
                <p className="font-mono text-terminal-muted text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  No text extracted from this page.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const TABS = ['Overview', 'Text', 'Tables', 'Entities', 'Metadata']

export default function ResultsPanel({ result }) {
  const [activeTab, setActiveTab] = useState('Overview')
  if (!result) return null

  const { filename, file_size, document_type, processing_time_seconds, extraction, entities, summary } = result

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="animate-slideUp space-y-5">
      {/* Header */}
      <div className="terminal-border rounded-xl border border-terminal-green/30 bg-terminal-green/5 px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <div>
              <p className="font-display font-semibold text-terminal-green">{filename}</p>
              <p className="font-mono text-terminal-muted text-xs mt-0.5">
                {formatSize(file_size)} · {document_type.toUpperCase()} · parsed in {processing_time_seconds}s
              </p>
            </div>
          </div>
          <span className="font-mono text-xs px-3 py-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/20 rounded-full">
            PARSE COMPLETE
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-terminal-surface rounded-xl p-1 border border-terminal-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
              activeTab === tab
                ? 'bg-terminal-accent text-terminal-bg font-semibold'
                : 'text-terminal-muted hover:text-terminal-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'Overview' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={FileText} label="Pages" value={summary.total_pages} color="accent" />
              <StatCard icon={Hash} label="Words" value={summary.total_words.toLocaleString()} color="green" />
              <StatCard icon={Table2} label="Tables" value={summary.tables_found} color="amber" />
              <StatCard icon={Search} label="Entities" value={summary.entities_found} color="red" />
            </div>

            {extraction.ocr_confidence !== undefined && (
              <div className="terminal-border rounded-xl border border-terminal-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-terminal-muted uppercase tracking-wider">OCR Confidence</span>
                  <span className={`font-mono font-bold text-sm ${extraction.ocr_confidence > 80 ? 'text-terminal-green' : extraction.ocr_confidence > 60 ? 'text-terminal-amber' : 'text-terminal-red'}`}>
                    {extraction.ocr_confidence}%
                  </span>
                </div>
                <div className="h-2 bg-terminal-border rounded-full overflow-hidden">
                  <div
                    className="h-full progress-bar-fill rounded-full"
                    style={{ width: `${extraction.ocr_confidence}%` }}
                  />
                </div>
              </div>
            )}

            <div className="terminal-border rounded-xl border border-terminal-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-terminal-muted">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-wider">Pipeline Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {[
                  ['File Type', document_type.toUpperCase()],
                  ['File Size', formatSize(file_size)],
                  ['Processing Time', `${processing_time_seconds}s`],
                  ['Characters', summary.total_chars?.toLocaleString() || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-terminal-surface rounded-lg px-3 py-2">
                    <span className="text-terminal-muted">{k}</span>
                    <span className="text-terminal-text">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Text' && (
          <div className="animate-fadeIn">
            <TextViewer pages={extraction.pages || []} />
          </div>
        )}

        {activeTab === 'Tables' && (
          <div className="animate-fadeIn">
            <TableViewer tables={extraction.tables || []} />
          </div>
        )}

        {activeTab === 'Entities' && (
          <div className="animate-fadeIn space-y-5">
            {Object.values(entities).every((v) => v.length === 0) ? (
              <p className="font-mono text-terminal-muted text-sm">No entities detected in this document.</p>
            ) : (
              <div className="terminal-border rounded-xl border border-terminal-border p-5 space-y-4">
                <EntityBadge label="Financial Amounts" items={entities.amounts} color="green" />
                <EntityBadge label="Dates" items={entities.dates} color="amber" />
                <EntityBadge label="Account Numbers" items={entities.account_numbers} color="red" />
                <EntityBadge label="Email Addresses" items={entities.emails} color="accent" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'Metadata' && (
          <div className="animate-fadeIn terminal-border rounded-xl border border-terminal-border overflow-hidden">
            <div className="p-4 border-b border-terminal-border flex items-center gap-2">
              <Database className="w-4 h-4 text-terminal-accent" />
              <span className="font-mono text-xs text-terminal-muted uppercase tracking-wider">Document Metadata</span>
            </div>
            <div className="divide-y divide-terminal-border/50">
              <div className="px-4 py-3 flex justify-between font-mono text-sm">
                <span className="text-terminal-muted">Filename</span>
                <span className="text-terminal-text">{filename}</span>
              </div>
              <div className="px-4 py-3 flex justify-between font-mono text-sm">
                <span className="text-terminal-muted">Total Pages</span>
                <span className="text-terminal-accent">{extraction.metadata?.num_pages}</span>
              </div>
              {Object.entries(extraction.metadata?.info || {}).map(([k, v]) => (
                <div key={k} className="px-4 py-3 flex justify-between font-mono text-sm">
                  <span className="text-terminal-muted capitalize">{k}</span>
                  <span className="text-terminal-text truncate max-w-xs">{String(v) || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
