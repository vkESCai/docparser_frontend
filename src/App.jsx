import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import UploadZone from './components/UploadZone'
import ResultsPanel from './components/ResultsPanel'
import BatchUpload from './components/BatchUpload'
import ExportPanel from './components/ExportPanel'
import ParseProgress from './components/ParseProgress'
import History from './pages/History'
import { useParser } from './hooks/useParser'
import { api } from './services/api'

const TOAST_STYLE = {
  background: '#111827',
  border: '1px solid',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '12px',
  borderRadius: '10px',
}

export default function App() {
  const [page, setPage] = useState('single')
  const [apiStatus, setApiStatus] = useState('checking')
  const [resultTab, setResultTab] = useState('results')

  const {
    result, error, status, uploadProgress,
    history, isLoading,
    parse, parseBatch, reset,
    clearHistory, removeFromHistory,
  } = useParser()

  useEffect(() => {
    const check = async () => {
      try {
        await api.health()
        setApiStatus('online')
      } catch {
        setApiStatus('offline')
      }
    }
    check()
    const iv = setInterval(check, 30_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (status === 'done' && result) {
      toast.success(`Parsed "${result.filename}" in ${result.processing_time_seconds}s`, {
        style: { ...TOAST_STYLE, color: '#00ff88', borderColor: '#00ff8830' },
        iconTheme: { primary: '#00ff88', secondary: '#111827' },
      })
      setResultTab('results')
    }
    if (status === 'error' && error) {
      toast.error(error, {
        style: { ...TOAST_STYLE, color: '#ff4757', borderColor: '#ff475730' },
      })
    }
  }, [status, result, error])

  const handleNav = (id) => {
    setPage(id)
    if (id === 'single') reset()
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      <div className="scanline" />
      <Toaster position="top-right" />
      <Navbar page={page} onNav={handleNav} historyCount={history.length} />

      <div className="bg-gradient-to-r from-terminal-accent/5 via-transparent to-terminal-green/5 border-b border-terminal-border">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <h2 className="font-display font-bold text-3xl leading-tight">
            {page === 'history' ? (
              <>Parse <span className="text-terminal-accent">History</span></>
            ) : page === 'batch' ? (
              <>Batch <span className="text-terminal-accent">Processing</span></>
            ) : (
              <>Document <span className="text-terminal-accent">Intelligence</span> Pipeline</>
            )}
          </h2>
          <p className="font-mono text-terminal-muted text-sm mt-2">
            {page === 'history'
              ? 'All previously parsed documents stored locally in your browser.'
              : page === 'batch'
              ? 'Upload up to 10 documents at once and process them in parallel.'
              : 'Upload a PDF or scanned image — extract text, tables & financial entities.'}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {page === 'history' ? (
          <History
            history={history}
            onClear={clearHistory}
            onRemove={removeFromHistory}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-6">
              {page === 'single' && (
                <>
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-5 bg-terminal-accent rounded-full" />
                      <h3 className="font-display font-semibold text-base">Upload Document</h3>
                    </div>
                    <UploadZone onUpload={parse} isLoading={isLoading} />
                  </section>

                  {(status === 'uploading' || status === 'parsing') && (
                    <ParseProgress status={status} uploadProgress={uploadProgress} />
                  )}

                  {status === 'done' && result && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-terminal-green rounded-full" />
                        <h3 className="font-display font-semibold text-base">Output</h3>
                        <div className="ml-auto flex gap-1 bg-terminal-surface border border-terminal-border rounded-lg p-0.5">
                          {['results', 'export'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setResultTab(t)}
                              className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all ${
                                resultTab === t
                                  ? 'bg-terminal-accent text-terminal-bg font-semibold'
                                  : 'text-terminal-muted hover:text-terminal-text'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      {resultTab === 'results'
                        ? <ResultsPanel result={result} />
                        : <ExportPanel result={result} />}
                    </section>
                  )}
                </>
              )}

              {page === 'batch' && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-terminal-accent rounded-full" />
                    <h3 className="font-display font-semibold text-base">Batch Upload</h3>
                  </div>
                  <BatchUpload onBatchParse={parseBatch} isLoading={isLoading} />
                </section>
              )}
            </div>

            <Sidebar apiStatus={apiStatus} />
          </div>
        )}
      </main>

      <footer className="border-t border-terminal-border mt-16 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
          <p className="font-mono text-terminal-muted text-xs">
            DocParser · React 18 + Tailwind CSS + FastAPI
          </p>
          <div className="flex items-center gap-4 font-mono text-xs text-terminal-muted">
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
              className="hover:text-terminal-accent transition-colors">FastAPI Swagger ↗</a>
            <span>·</span>
            <a href="http://localhost:8000/redoc" target="_blank" rel="noopener noreferrer"
              className="hover:text-terminal-accent transition-colors">ReDoc ↗</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
