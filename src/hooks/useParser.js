import { useState, useCallback, useRef } from 'react'
import { api } from '../services/api'

const HISTORY_KEY = 'docparser_history'
const MAX_HISTORY = 20

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
  } catch {}
}

export function useParser() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | parsing | done | error
  const [uploadProgress, setUploadProgress] = useState(0)
  const [history, setHistory] = useState(loadHistory)
  const abortRef = useRef(null)

  const parse = useCallback(async (file) => {
    setStatus('uploading')
    setError(null)
    setResult(null)
    setUploadProgress(0)

    try {
      const res = await api.parse(file, (pct) => {
        setUploadProgress(pct)
        if (pct === 100) setStatus('parsing')
      })

      const data = res.data
      setResult(data)
      setStatus('done')

      // Persist to history (strip full_text to keep storage lean)
      const record = {
        id: crypto.randomUUID(),
        filename: data.filename,
        file_size: data.file_size,
        document_type: data.document_type,
        processing_time_seconds: data.processing_time_seconds,
        summary: data.summary,
        parsedAt: new Date().toISOString(),
      }
      setHistory((prev) => {
        const next = [record, ...prev].slice(0, MAX_HISTORY)
        saveHistory(next)
        return next
      })
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [])

  const parseBatch = useCallback(async (files) => {
    setStatus('parsing')
    setError(null)
    try {
      const res = await api.parseBatch(files)
      setStatus('done')
      return res.data
    } catch (err) {
      setError(err.message)
      setStatus('error')
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setStatus('idle')
    setUploadProgress(0)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((r) => r.id !== id)
      saveHistory(next)
      return next
    })
  }, [])

  return {
    result,
    error,
    status,
    uploadProgress,
    history,
    isLoading: status === 'uploading' || status === 'parsing',
    parse,
    parseBatch,
    reset,
    clearHistory,
    removeFromHistory,
  }
}
