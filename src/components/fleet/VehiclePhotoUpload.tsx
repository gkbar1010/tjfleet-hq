'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Camera, Loader2, AlertCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface VehiclePhotoUploadProps {
  currentUrl: string | null
  vehicleId?: string
  onUploaded: (url: string) => void
  onUploading: (uploading: boolean) => void
}

async function convertHeicToJpeg(file: File): Promise<File> {
  // Dynamic import to avoid SSR issues
  const heic2any = (await import('heic2any')).default
  const blob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  })
  const resultBlob = Array.isArray(blob) ? blob[0] : blob
  return new File([resultBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
    type: 'image/jpeg',
  })
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: file.type as string,
  })
}

export default function VehiclePhotoUpload({
  currentUrl,
  vehicleId,
  onUploaded,
  onUploading,
}: VehiclePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processAndUpload = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)
    onUploading(true)

    try {
      let processedFile = file

      // Check if HEIC/HEIF
      const isHeic = /\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif'

      if (isHeic) {
        setStatus('Converting HEIC...')
        try {
          processedFile = await convertHeicToJpeg(file)
        } catch {
          setError('Could not convert HEIC file. Try a JPG or PNG instead.')
          setUploading(false)
          onUploading(false)
          return
        }
      }

      // Validate type after potential conversion
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(processedFile.type)) {
        setError(`Unsupported format: ${processedFile.type}. Use JPG, PNG, or WEBP.`)
        setUploading(false)
        onUploading(false)
        return
      }

      // Show preview immediately
      const previewUrl = URL.createObjectURL(processedFile)
      setPreview(previewUrl)

      // Compress
      setStatus('Compressing...')
      const compressed = await compressImage(processedFile)

      // Upload
      setStatus('Uploading...')
      const formData = new FormData()
      formData.append('file', compressed)
      if (vehicleId) formData.append('vehicleId', vehicleId)

      const res = await fetch('/api/upload/vehicle-photo', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Upload failed')
        setUploading(false)
        onUploading(false)
        return
      }

      // Success
      setPreview(data.url)
      onUploaded(data.url)
      setStatus(null)
      setError(null)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      onUploading(false)
    }
  }, [vehicleId, onUploaded, onUploading])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processAndUpload(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processAndUpload(file)
  }

  function handleRemove() {
    setPreview(null)
    setError(null)
    setStatus(null)
    onUploaded('')
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.heic,.heif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        /* Photo preview with replace/remove */
        <div className="relative group">
          <img
            src={preview}
            alt="Vehicle photo"
            className="w-full h-48 object-cover rounded-lg border border-[#1e1e1e]"
          />
          {/* Overlay on hover */}
          {!uploading && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-[#E10600] text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-[#FF2D2D] transition-colors flex items-center gap-1.5"
              >
                <Camera size={14} />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-[#222] text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-[#333] transition-colors flex items-center gap-1.5"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          )}
          {/* Upload status overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center">
              <Loader2 size={24} className="text-[#E10600] animate-spin" />
              <span className="text-white text-sm mt-2 font-medium">{status}</span>
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragOver
              ? 'border-[#E10600] bg-[#E10600]/5'
              : 'border-[#222] bg-[#0e0e0e] hover:border-[#E10600]/50 hover:bg-[#0e0e0e]'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="text-[#E10600] animate-spin" />
              <span className="text-[#888] text-sm mt-2">{status}</span>
            </>
          ) : (
            <>
              <Upload size={28} className="text-[#444]" />
              <span className="text-[#888] text-sm mt-2 font-medium">
                Drop photo here or click to upload
              </span>
              <span className="text-[#444] text-xs mt-1">
                JPG, PNG, WEBP, HEIC — max 20MB
              </span>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-[#ff6666]">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[#E10600] underline ml-1"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
