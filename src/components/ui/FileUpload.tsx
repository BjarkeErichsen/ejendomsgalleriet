'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label: string
  helpText?: string
  maxSize?: number
}

export function FileUpload({
  onFilesSelected,
  accept = 'image/jpeg,image/png,image/jpg',
  multiple = true,
  label,
  helpText,
  maxSize = 20,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileNames, setFileNames] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const validFiles: File[] = []
      Array.from(files).forEach((file) => {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`${file.name} er for stor. Maks filstørrelse ${maxSize}MB.`)
          return
        }
        validFiles.push(file)
      })
      if (validFiles.length > 0) {
        setFileNames((prev) => [...prev, ...validFiles.map((f) => f.name)])
        onFilesSelected(validFiles)
      }
    },
    [maxSize, onFilesSelected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragOver
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-600">
          <span className="text-green-700 font-medium">Træk filer hertil</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          eller <span className="text-green-700 underline">vælg fra enhed</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {helpText && <p className="mt-1.5 text-xs text-gray-500">{helpText}</p>}
      {fileNames.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
