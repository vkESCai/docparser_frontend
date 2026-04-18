import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Files, X, CheckCircle2, XCircle, Loader2, Upload, Zap } from 'lucide-react'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tiff'],
  'image/bmp': ['.bmp'],
}

function FileRow({ file, result, status }) {
  const fmt = (b) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-terminal-border last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-terminal-text truncate">{file.name}</p>
        <p className="font-mono text-xs text-terminal-muted">{fmt(file.size)}</p>
      </div>
      <div className="shrink-0">
        {status === 'pending' && <span className="font-mono text-xs text-terminal-muted">Queued</span>}
        {status === 'processing' && <Loader2 className="w-4 h-4 text-terminal-accent animate-spin" />}
        {status === 'done' && result?.success && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-terminal-green">{result.summary?.total_words} words</span>
            <CheckCircle2 className="w-4 h-4 text-terminal-green" />
          </div>
        )}
        {(status === 'error' || (status === 'done' && !result?.success)) && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-terminal-red truncate max-w-32">{result?.error || 'Failed'}</span>
            <XCircle className="w-4 h-4 text-terminal-red" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function BatchUpload({ onBatchParse, isLoading }) {
  const [files, setFiles] = useState([])
  const [batchResult, setBatchResult] = useState(null)
  const [processing, setProcessing] = useState(false)

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      const fresh = accepted.filter((f) => !existing.has(f.name))
      return [...prev, ...fresh].slice(0, 10)
    })
    setBatchResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  })

  const removeFile = (name) => setFiles((p) => p.filter((f) => f.name !== name))

  const handleBatch = async () => {
    if (!files.length || processing) return
    setProcessing(true)
    setBatchResult(null)
    const result = await onBatchParse(files)
    setBatchResult(result)
    setProcessing(false)
  }

  const resultMap = {}
  if (batchResult?.batch_results) {
    batchResult.batch_results.forEach((r) => { resultMap[r.filename] = r })
  }

  const getStatus = (file) => {
    if (!batchResult) return processing ? 'processing' : 'pending'
    return resultMap[file.name] ? 'done' : 'pending'
  }

  return (
    <div className="space-y-4 animate-slideUp">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300
          ${isDragActive ? 'border-terminal-accent bg-terminal-accent/5' : 'border-terminal-border hover:border-terminal-accent/40'}`}
      >
        <input {...getInputProps()} />
        <div className="absolute inset-0 opacity-5 rounded-xl" style={{
          backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        <div className="relative z-10">
          <Files className="w-9 h-9 text-terminal-muted mx-auto mb-3" />
          <p className="font-display font-semibold text-terminal-text">
            Drop multiple documents
          </p>
          <p className="font-mono text-terminal-muted text-xs mt-1">
            Up to 10 files · PDF, PNG, JPG, TIFF
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="terminal-border rounded-xl border border-terminal-border overflow-hidden">
          <div className="px-4 py-3 bg-terminal-surface border-b border-terminal-border flex items-center justify-between">
            <span className="font-mono text-xs text-terminal-muted uppercase tracking-wider">
              {files.length} file{files.length !== 1 ? 's' : ''} queued
            </span>
            <button
              onClick={() => { setFiles([]); setBatchResult(null) }}
              className="font-mono text-xs text-terminal-muted hover:text-terminal-red transition-colors"
            >
              Clear all
            </button>
          </div>
          {files.map((file) => (
            <div key={file.name} className="relative group">
              <FileRow
                file={file}
                result={resultMap[file.name]}
                status={getStatus(file)}
              />
              {!processing && !batchResult && (
                <button
                  onClick={() => removeFile(file.name)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-terminal-border transition-all"
                >
                  <X className="w-3 h-3 text-terminal-muted" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Batch Summary */}
      {batchResult && (
        <div className="terminal-border rounded-xl border border-terminal-green/30 bg-terminal-green/5 p-4 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-terminal-green" />
            <span className="font-mono text-sm text-terminal-green">Batch complete</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Processed', batchResult.total_processed],
              ['Succeeded', batchResult.batch_results.filter((r) => r.success).length],
              ['Failed', batchResult.batch_results.filter((r) => !r.success).length],
            ].map(([label, val]) => (
              <div key={label} className="bg-terminal-bg rounded-lg px-3 py-2 text-center">
                <p className="font-mono text-xs text-terminal-muted">{label}</p>
                <p className="font-display font-bold text-lg text-terminal-text">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        onClick={handleBatch}
        disabled={!files.length || processing}
        className={`w-full py-4 rounded-xl font-mono font-semibold text-sm tracking-widest uppercase
          flex items-center justify-center gap-3 transition-all duration-300
          ${files.length && !processing
            ? 'bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/90 glow-accent active:scale-[0.98]'
            : 'bg-terminal-border text-terminal-muted cursor-not-allowed'}`}
      >
        {processing ? (
          <><Loader2 className="w-4 h-4 animate-spin" />PROCESSING BATCH...</>
        ) : (
          <><Zap className="w-4 h-4" />PARSE {files.length || ''} DOCUMENTS</>
        )}
      </button>
    </div>
  )
}
