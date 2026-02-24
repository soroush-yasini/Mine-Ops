import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import api from '../../lib/api'

interface FileUploadProps {
  type: 'image' | 'pdf'
  onUpload: (url: string) => void
  currentUrl?: string | null
}

export default function FileUpload({ type, onUpload, currentUrl }: FileUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    const formData = new FormData()
    formData.append('file', acceptedFiles[0])
    const endpoint = type === 'pdf' ? '/upload/pdf' : '/upload/image'
    try {
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onUpload(data.url)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }, [type, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'pdf' ? { 'application/pdf': ['.pdf'] } : { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-sm text-gray-500">
          {isDragActive ? 'رها کنید...' : `${type === 'pdf' ? 'PDF' : 'تصویر'} را اینجا رها کنید یا کلیک کنید`}
        </p>
      </div>
      {currentUrl && (
        <div className="mt-2 text-sm text-blue-600">
          <a href={currentUrl} target="_blank" rel="noopener noreferrer">مشاهده فایل آپلود شده</a>
        </div>
      )}
    </div>
  )
}
