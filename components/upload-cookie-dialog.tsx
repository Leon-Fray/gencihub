'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadCookieFiles } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Upload, X } from 'lucide-react'

export function UploadCookieDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one cookie file to upload.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })
      
      const result = await uploadCookieFiles(formData)
      
      toast({
        title: "Cookie Files Uploaded",
        description: result.message,
      })
      setOpen(false)
      setSelectedFiles([])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload cookie files",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return
    
    // Validate file extensions
    const invalidFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      return !ext || !['json', 'txt'].includes(ext)
    })
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: `${invalidFiles.length} file(s) skipped. Only .json and .txt files are supported.`,
        variant: "destructive",
      })
      e.target.value = ''
      return
    }
    
    setSelectedFiles(files)
  }

  function removeFile(index: number) {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  function getTotalSize() {
    return selectedFiles.reduce((sum, file) => sum + file.size, 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Cookie Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Cookie Files</DialogTitle>
          <DialogDescription>
            Upload one or multiple cookie files (.json or .txt). They will be automatically renamed to Cookie_1, Cookie_2, etc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cookieFiles">Cookie Files</Label>
              <Input
                id="cookieFiles"
                name="cookieFiles"
                type="file"
                accept=".json,.txt"
                multiple
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="rounded-md border border-gray-200 p-3 max-h-[200px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                    ({(getTotalSize() / 1024).toFixed(2)} KB total)
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div 
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                    >
                      <div className="flex-1 truncate">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-gray-500 ml-2">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={loading}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Files will be automatically renamed to Cookie_{'{n}'} 
                while preserving the file extension (e.g., Cookie_1.json, Cookie_2.txt).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false)
                setSelectedFiles([])
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedFiles.length === 0}>
              {loading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

