import { useState, useRef } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@travelagency/ui'
import { Input } from '@travelagency/ui'
import { Button } from '@travelagency/ui'
import { Loader2, Upload } from 'lucide-react'
import { showToast } from "@/lib/toast";
import axiosClient from '@/lib/apiClient'
import { ENDPOINTS } from '@/lib/endpoints'

export interface PromptConfig {
  isOpen: boolean;
  title: string;
  placeholder: string;
  initialValue: string;
  onSave: (val: string) => void;
  showUpload?: boolean;
}

interface EditorLinkModalProps {
  promptConfig: PromptConfig;
  setPromptConfig: React.Dispatch<React.SetStateAction<PromptConfig>>;
}

export const EditorLinkModal = ({ promptConfig, setPromptConfig }: EditorLinkModalProps) => {
  const [promptValue, setPromptValue] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      
      const { data } = await axiosClient.post(ENDPOINTS.client.upload.image, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data?.url) {
        setPromptValue(data.url)
        showToast({ type: 'success', content: 'Image uploaded successfully' })
      }
    } catch (err) {
      showToast({ type: 'error', content: 'Image upload failed' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSavePrompt = () => {
    promptConfig.onSave(promptValue || promptConfig.initialValue)
    setPromptConfig(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <Dialog open={promptConfig.isOpen} onOpenChange={(open: boolean) => setPromptConfig(prev => ({ ...prev, isOpen: open }))}>
      <DialogContent className="sm:max-w-md bg-white shadow-2xl border-neutral-200">
        <DialogHeader>
          <DialogTitle>{promptConfig.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
              {promptConfig.showUpload ? 'Image URL' : 'Link URL'}
            </label>
            <Input
              value={promptValue || promptConfig.initialValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromptValue(e.target.value)}
              placeholder={promptConfig.placeholder}
              className="w-full"
              autoFocus
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') handleSavePrompt()
              }}
            />
          </div>

          {promptConfig.showUpload && (
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-100" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-neutral-400 font-bold tracking-widest">or</span></div>
            </div>
          )}

          {promptConfig.showUpload && (
            <div className="flex justify-center pt-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed border-neutral-300 hover:border-primary hover:bg-neutral-50 gap-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload size={16} className="text-primary" />}
                {isUploading ? 'Uploading Media...' : 'Browse Local Media'}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-end border-t pt-4">
          <Button type="button" variant="secondary" className="px-6 rounded-xl font-bold" onClick={() => setPromptConfig(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
          <Button type="button" className="px-8 rounded-xl font-bold" onClick={handleSavePrompt} disabled={isUploading}>Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

