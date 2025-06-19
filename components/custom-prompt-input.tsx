"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Paperclip, ArrowUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ModelSelector } from "@/components/model-selector"
import { AppConfig } from "@/lib/app-config"

interface CustomPromptInputProps {
  input?: string
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit?: (e?: React.FormEvent<HTMLFormElement>, options?: any) => void
  onSend?: (message: string, files?: File[]) => void
  isLoading?: boolean
  placeholder?: string
  selectedModel?: string
  onModelSelect?: (modelId: string) => void
}

export function CustomPromptInput({
  input = "",
  handleInputChange,
  handleSubmit,
  onSend = () => {},
  isLoading = false,
  placeholder = "Type your message here...",
  selectedModel = "gpt-4o-mini",
  onModelSelect = () => {},
}: CustomPromptInputProps) {
  const [localInput, setLocalInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  // Use input from useChat hook if provided, otherwise use local state
  const currentInput = input !== undefined ? input : localInput
  const currentHandleInputChange = handleInputChange || ((e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalInput(e.target.value))

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      // Set the height to the scrollHeight, but cap it at max-height
      const maxHeight = 160 // max-h-40 is 10rem = 160px
      const scrollHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = `${scrollHeight}px`
    }
  }, [currentInput])

  const isImageFile = (file: File) => file.type.startsWith("image/")

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed")
      return
    }
    if (file.size > AppConfig.maxImageSize) {
      console.log(`File too large (max ${AppConfig.maxImageSize / 1024 / 1024}MB)`)
      return
    }
    
    setFiles([file])
    const reader = new FileReader()
    reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string })
    reader.readAsDataURL(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(isImageFile)
    if (imageFiles.length > 0) {
      processFile(imageFiles[0])
    }
  }, [])

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove && filePreviews[fileToRemove.name]) {
      setFilePreviews({})
    }
    setFiles([])
  }

  const internalHandleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    
    // Check if we have content to send
    if (!currentInput.trim() && files.length === 0) {
      return
    }
    
    if (handleSubmit) {
      // Use handleSubmit with experimental_attachments for proper AI SDK file handling
      if (files.length > 0) {
        // Create a proper FileList for experimental_attachments
        const dt = new DataTransfer()
        files.forEach(file => dt.items.add(file))
        const fileList = dt.files
        
        console.log("📎 Sending with experimental_attachments:", {
          fileCount: fileList.length,
          files: Array.from(fileList).map(f => ({ name: f.name, size: f.size, type: f.type }))
        })
        
        handleSubmit(e, {
          experimental_attachments: fileList
        })
        
        // Clear files after successful submission
        setFiles([])
        setFilePreviews({})
      } else {
        // Text-only submission
        handleSubmit(e)
      }
    } else {
      // Fallback to onSend for backward compatibility
      onSend(currentInput, files)
      setLocalInput("")
      setFiles([])
      setFilePreviews({})
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      internalHandleSubmit()
    }
  }

  const hasContent = currentInput.trim() !== "" || files.length > 0

  return (
    <form
      onSubmit={internalHandleSubmit}
      className="rounded-2xl border bg-background shadow-lg transition-all duration-300 border-border dark:border-gray-600 dark:bg-gray-800"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File Preview */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 pb-0">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith("image/") && filePreviews[file.name] && (
                <div className="w-16 h-16 rounded-xl overflow-hidden relative">
                  <img
                    src={filePreviews[file.name]}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Layout - use mobile-like structure for all screen sizes */}
      <div className="flex flex-col gap-3 p-3">
        {/* Top controls row */}
        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="flex h-10 w-10 text-gray-400 dark:text-gray-500 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm"
            disabled={isLoading || files.length >= AppConfig.maxImagesPerMessage}
          >
            <Paperclip className="h-4 w-4" />
            <input
              ref={uploadInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processFile(e.target.files[0])
                }
                if (e.target) e.target.value = ""
              }}
              accept="image/*"
            />
          </button>

          {/* Model Selector */}
          <ModelSelector selectedModel={selectedModel} onModelSelect={onModelSelect} />

          {/* Send Button */}
          <div className="ml-auto">
            <Button
              type="submit"
              variant="default"
              size="icon"
              className={`h-10 w-10 rounded-xl transition-all duration-200 ${
                hasContent
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
              disabled={isLoading || !hasContent}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Input field */}
        <div className="w-full">
          <Textarea
            ref={textareaRef}
            value={currentInput}
            onChange={currentHandleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="resize-none border-none bg-transparent focus:ring-0 focus:outline-none min-h-[44px] max-h-40 text-base w-full overflow-hidden"
            disabled={isLoading}
            rows={1}
            style={{ height: 'auto' }}
          />
        </div>
      </div>
    </form>
  )
} 