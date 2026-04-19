import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Files, X, CheckCircle2, XCircle, Loader2,
  Zap, ChevronDown, ChevronUp, FileText, Image,
  RotateCcw, Download
} from 'lucide-react'
import ResultsPanel from './ResultsPanel'
import ExportPanel from './ExportPanel'
import { api } from '../services/api'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tiff'],
  'image/bmp': ['.bmp'],
}

const fmt = (b) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`

// Status badge
function StatusBadge({ status }) {
  if (status === 'queued')
    return <span className="font-mono text-xs text-terminal-muted px-2 py-0.5 rounded-full border border-terminal-border">Queued</span>
  if (status === 'processing')
    return (
      <span className="font-mono text-xs text-terminal-accent px-2 py-0.5 rounded-full border border-terminal-accent/30 bg-terminal-accent/10 flex items-center gap-1.5">
        <Loader2 className="w-3 h-3 animate-spin" /> Parsing...
      </span>
    )
  if (status === 'done')
    return (
      <span className="font-mono text-xs text-terminal-green px-2 py-0.5 rounded-full border border-terminal-green/30 bg-terminal-green/10 flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3" /> Done
      </span>
    )
  if (status === 'error')
    return (
      <span className="font-mono text-xs text-terminal-red px-2 py-0.5 rounded-full border border-terminal-red/30 bg-terminal-red/10 flex items-center gap-1.5">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    )
  return null
}

// Single file result card — expandable with full ResultsPanel + ExportPanel
function FileResultCard({ fileState, onRemove, canRemove }) {
  const { file, status, result, error } = fileState
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('results')

  const isExpandable = status === 'done' && result

  return (
    <div className={`terminal-border rounded-xl border overflow-hidden transition-all duration-300
      ${status === 'done' ? 'border-terminal-green/30' :
        status === 'error' ? 'border-terminal-red/30' :
        status === 'processing' ? 'border-terminal-accent/30' :
        'border-terminal-border'}`}>

      {/* File Header Row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${isExpandable ? 'cursor-pointer hover:bg-terminal-surface/50' : ''} transition-colors`}
        onClick={() => isExpandable && setExpanded((v) => !v)}
      >
        {/* Icon */}
        <div className={`p-2 rounded-lg border shrink-0
          ${status === 'done' ? 'border-terminal-green/20 bg-terminal-green/5' :
            status === 'error' ? 'border-terminal-red/20 bg-terminal-red/5' :
            status === 'processing' ? 'border-terminal-accent/20 bg-terminal-accent/5' :
            'border-terminal-border bg-terminal-surface'}`}>
          {file.type === 'application/pdf' || file.name.endsWith('.pdf')
            ? <FileText className={`w-4 h-4 ${status === 'done' ? 'text-terminal-green' : status === 'processing' ? 'text-terminal-accent' : 'text-terminal-muted'}`} />
            : <Image className={`w-4 h-4 ${status === 'done' ? 'text-terminal-green' : status === 'processing' ? 'text-terminal-accent' : 'text-terminal-muted'}`} />
          }
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm text-terminal-text truncate">{file.name}</p>
          <div className="flex items-center gap-3 mt-0.5 font-mono text-xs text-terminal-muted">
            <span>{fmt(file.size)}</span>
            {status === 'done' && result && (
              <>
                <span>·</span>
                <span>{result.summary?.total_pages} pages</span>
                <span>·</span>
                <span>{result.summary?.total_words?.toLocaleString()} words</span>
                <span>·</span>
                <span>{result.summary?.tables_found} tables</span>
                <span>·</span>
                <span className="text-terminal-accent">{result.processing_time_seconds}s</span>
              </>
            )}
            {status === 'error' && (
              <span className="text-terminal-red truncate max-w-xs">{error}</span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} />
          {canRemove && status !== 'processing' && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(file.name) }}
              className="p-1.5 rounded-lg hover:bg-terminal-red/10 hover:text-terminal-red text-terminal-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isExpandable && (
            expanded
              ? <ChevronUp className="w-4 h-4 text-terminal-muted" />
              : <ChevronDown className="w-4 h-4 text-terminal-muted" />
          )}
        </div>
      </div>

      {/* Expanded Full Results — same as single upload */}
      {expanded && isExpandable && (
        <div className="border-t border-terminal-border animate-fadeIn">
          {/* Sub-tabs: Results | Export */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-terminal-border bg-terminal-surface/50">
            <div className="flex gap-1 bg-terminal-bg border border-terminal-border rounded-lg p-0.5">
              {['results', 'export'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all ${
                    tab === t
                      ? 'bg-terminal-accent text-terminal-bg font-semibold'
                      : 'text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {tab === 'results'
              ? <ResultsPanel result={result} />
              : <ExportPanel result={result} />}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BatchUpload() {
  const [fileStates, setFileStates] = useState([]) // [{file, status, result, error}]
  const [processing, setProcessing] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const onDrop = useCallback((accepted) => {
    setAllDone(false)
    setFileStates((prev) => {
      const existing = new Set(prev.map((fs) => fs.file.name))
      const fresh = accepted
        .filter((f) => !existing.has(f.name))
        .map((f) => ({ file: f, status: 'queued', result: null, error: null }))
      return [...prev, ...fresh].slice(0, 10)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  })

  const removeFile = (name) => {
    setFileStates((p) => p.filter((fs) => fs.file.name !== name))
  }

  const updateState = (name, patch) => {
    setFileStates((prev) =>
      prev.map((fs) => fs.file.name === name ? { ...fs, ...patch } : fs)
    )
  }

  const handleRun = async () => {
    if (!fileStates.length || processing) return
    setProcessing(true)
    setAllDone(false)

    // Reset all to queued
    setFileStates((prev) => prev.map((fs) => ({ ...fs, status: 'queued', result: null, error: null })))

    // Parse each file one by one using the same /parse endpoint as single upload
    for (const fs of fileStates) {
      updateState(fs.file.name, { status: 'processing' })
      try {
        const res = await api.parse(fs.file)
        updateState(fs.file.name, { status: 'done', result: res.data })
      } catch (err) {
        updateState(fs.file.name, { status: 'error', error: err.message || 'Parsing failed' })
      }
    }

    setProcessing(false)
    setAllDone(true)
  }

  const handleReset = () => {
    setFileStates([])
    setAllDone(false)
  }

  const done = fileStates.filter((fs) => fs.status === 'done').length
  const failed = fileStates.filter((fs) => fs.status === 'error').length
  const queued = fileStates.filter((fs) => fs.status === 'queued').length

  return (
    <div className="space-y-4 animate-slideUp">

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300
          ${isDragActive
            ? 'border-terminal-accent bg-terminal-accent/5 scale-[1.01]'
            : fileStates.length
            ? 'border-terminal-border hover:border-terminal-accent/40'
            : 'border-terminal-border hover:border-terminal-accent/40'}`}
      >
        <input {...getInputProps()} />
        <div className="absolute inset-0 opacity-5 rounded-xl pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        <div className="relative z-10">
          <Files className={`w-9 h-9 mx-auto mb-3 ${isDragActive ? 'text-terminal-accent' : 'text-terminal-muted'}`} />
          <p className="font-display font-semibold text-terminal-text">
            {isDragActive ? 'DROP FILES HERE' : 'Drop multiple documents'}
          </p>
          <p className="font-mono text-terminal-muted text-xs mt-1">
            Up to 10 files · PDF, PNG, JPG, TIFF · 50 MB each
          </p>
          {fileStates.length > 0 && (
            <p className="font-mono text-terminal-accent text-xs mt-2">
              + Add more files ({10 - fileStates.length} slots remaining)
            </p>
          )}
        </div>
      </div>

      {/* File list with full expandable results */}
      {fileStates.length > 0 && (
        <div className="space-y-2">
          {/* List header */}
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs text-terminal-muted uppercase tracking-wider">
              {fileStates.length} file{fileStates.length !== 1 ? 's' : ''}
              {processing && ` · ${done} done · ${queued} queued`}
              {allDone && ` · ${done} succeeded · ${failed} failed`}
            </span>
            {!processing && (
              <button
                onClick={handleReset}
                className="font-mono text-xs text-terminal-muted hover:text-terminal-red transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Progress bar while processing */}
          {processing && (
            <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
              <div
                className="h-full progress-bar-fill rounded-full transition-all duration-500"
                style={{ width: `${fileStates.length ? (done / fileStates.length) * 100 : 0}%` }}
              />
            </div>
          )}

          {/* Each file card */}
          {fileStates.map((fs) => (
            <FileResultCard
              key={fs.file.name}
              fileState={fs}
              onRemove={removeFile}
              canRemove={!processing}
            />
          ))}
        </div>
      )}

      {/* Batch summary after all done */}
      {allDone && fileStates.length > 0 && (
        <div className="terminal-border rounded-xl border border-terminal-green/30 bg-terminal-green/5 p-4 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-terminal-green" />
            <span className="font-mono text-sm text-terminal-green font-semibold">Batch Pipeline Complete</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              ['Total', fileStates.length, 'accent'],
              ['Parsed', done, 'green'],
              ['Failed', failed, 'red'],
              ['Tables Found', fileStates.reduce((acc, fs) => acc + (fs.result?.summary?.tables_found || 0), 0), 'amber'],
            ].map(([label, val, color]) => (
              <div key={label} className="bg-terminal-bg rounded-lg px-3 py-2 text-center">
                <p className="font-mono text-xs text-terminal-muted">{label}</p>
                <p className={`font-display font-bold text-xl ${
                  color === 'green' ? 'text-terminal-green' :
                  color === 'red' ? 'text-terminal-red' :
                  color === 'amber' ? 'text-terminal-amber' :
                  'text-terminal-accent'}`}>{val}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-terminal-muted mt-3">
            Click any parsed file above to expand its full results, text, tables, entities and export options.
          </p>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={!fileStates.length || processing}
        className={`w-full py-4 rounded-xl font-mono font-semibold text-sm tracking-widest uppercase
          flex items-center justify-center gap-3 transition-all duration-300
          ${fileStates.length && !processing
            ? 'bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/90 glow-accent active:scale-[0.98]'
            : 'bg-terminal-border text-terminal-muted cursor-not-allowed'}`}
      >
        {processing ? (
          <><Loader2 className="w-4 h-4 animate-spin" />PARSING {done + 1} OF {fileStates.length}...</>
        ) : allDone ? (
          <><RotateCcw className="w-4 h-4" />RUN AGAIN</>
        ) : (
          <><Zap className="w-4 h-4" />PARSE {fileStates.length || ''} DOCUMENTS</>
        )}
      </button>
    </div>
  )
}
