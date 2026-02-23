import { useRef, useState } from 'react'
import { Box, Button, Typography, LinearProgress, Link, IconButton } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'

interface FileUploadProps {
  label: string
  currentUrl?: string | null
  onUpload: (file: File) => void
  accept?: string
  uploading?: boolean
  progress?: number
}

export default function FileUpload({
  label, currentUrl, onUpload, accept, uploading = false, progress = 0
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      onUpload(file)
    }
  }

  return (
    <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {label}
      </Typography>
      {currentUrl && !selectedFile && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Link href={currentUrl} target="_blank" rel="noopener noreferrer" variant="body2">
            مشاهده فایل فعلی
          </Link>
        </Box>
      )}
      {selectedFile && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {selectedFile.name}
          </Typography>
          <IconButton size="small" onClick={() => { setSelectedFile(null); if (inputRef.current) inputRef.current.value = '' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      {uploading && (
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {currentUrl || selectedFile ? 'تغییر فایل' : 'انتخاب فایل'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  )
}
