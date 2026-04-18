import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, X, Loader2, Zap } from 'lucide-react'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tiff', '.tif'],
  'image/bmp': ['.bmp'],
}

export default function UploadZone({ onUpload, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  const handleSubmit = () => {
    if (selectedFile && !isLoading) {
      onUpload(selectedFile)
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    setPreview(null)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="space-y-4 animate-slideUp">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
          ${isDragActive
            ? 'border-terminal-accent bg-terminal-accent/5 scale-[1.01]'
            : selectedFile
            ? 'border-terminal-green bg-terminal-green/5'
            : 'border-terminal-border hover:border-terminal-accent/50 hover:bg-terminal-accent/3'
          }
          p-10 text-center overflow-hidden
        `}
      >
        <input {...getInputProps()} />

        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        {selectedFile ? (
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-center gap-3">
              {selectedFile.type === 'application/pdf' ? (
                <FileText className="w-10 h-10 text-terminal-green" />
              ) : (
                <Image className="w-10 h-10 text-terminal-green" />
              )}
              <div className="text-left">
                <p className="font-mono text-terminal-green font-medium truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-terminal-muted text-sm">
                  {formatSize(selectedFile.size)} · {selectedFile.type}
                </p>
              </div>
              <button
                onClick={handleClear}
                className="ml-4 p-1.5 rounded-lg bg-terminal-border hover:bg-terminal-red/20 hover:text-terminal-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {preview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-terminal-border max-h-40 flex items-center justify-center">
                <img src={preview} alt="preview" className="max-h-40 object-contain" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <div className={`p-5 rounded-2xl border ${isDragActive ? 'border-terminal-accent bg-terminal-accent/10' : 'border-terminal-border bg-terminal-surface'}`}>
                <Upload className={`w-10 h-10 ${isDragActive ? 'text-terminal-accent' : 'text-terminal-muted'}`} />
              </div>
            </div>
            <div>
              <p className="text-terminal-text font-display font-semibold text-lg">
                {isDragActive ? 'DROP IT HERE' : 'Drop your document here'}
              </p>
              <p className="text-terminal-muted text-sm mt-1 font-mono">
                PDF, PNG, JPG, TIFF, BMP · max 50 MB
              </p>
            </div>
            <p className="text-terminal-muted/60 text-xs font-mono">
              or click to browse files
            </p>
          </div>
        )}
      </div>

      {/* Parse Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className={`
          w-full py-4 rounded-xl font-mono font-semibold text-sm tracking-widest uppercase
          flex items-center justify-center gap-3 transition-all duration-300
          ${selectedFile && !isLoading
            ? 'bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/90 glow-accent active:scale-[0.98]'
            : 'bg-terminal-border text-terminal-muted cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            PARSING DOCUMENT...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            RUN PARSER PIPELINE
          </>
        )}
      </button>
    </div>
  )
}
