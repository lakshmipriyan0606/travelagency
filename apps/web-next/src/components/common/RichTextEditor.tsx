import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import { showToast } from "@/lib/toast";
import axiosClient from '@/api/axiosClient'
import { Loader2, Upload } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor, onOpenPrompt }: { editor: any, onOpenPrompt: (config: any) => void }) => {
  if (!editor) {
    return null
  }

  const addImage = () => {
    onOpenPrompt({
      title: 'Insert Image',
      placeholder: 'https://example.com/image.jpg',
      initialValue: '',
      showUpload: true,
      onSave: (url: string) => {
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      }
    })
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href
    onOpenPrompt({
      title: 'Edit Link',
      placeholder: 'https://example.com',
      initialValue: previousUrl || '',
      onSave: (url: string) => {
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else if (url) {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
      }
    })
  }

  const toggleBtnClass = (isActive: boolean) =>
    `p-2 rounded-md transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-neutral-600 hover:bg-neutral-100'}`

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-20 z-20 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={toggleBtnClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toggleBtnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={toggleBtnClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>

      <div className="w-px h-6 bg-neutral-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={toggleBtnClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={toggleBtnClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={toggleBtnClass(editor.isActive('underline'))}
        title="Underline"
      >
        <UnderlineIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={toggleBtnClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>

      <div className="w-px h-6 bg-neutral-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={toggleBtnClass(editor.isActive({ textAlign: 'left' }))}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={toggleBtnClass(editor.isActive({ textAlign: 'center' }))}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={toggleBtnClass(editor.isActive({ textAlign: 'right' }))}
        title="Align Right"
      >
        <AlignRight size={18} />
      </button>

      <div className="w-px h-6 bg-neutral-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={toggleBtnClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={toggleBtnClass(editor.isActive('orderedList'))}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={toggleBtnClass(editor.isActive('blockquote'))}
        title="Quote"
      >
        <Quote size={18} />
      </button>

      <div className="w-px h-6 bg-neutral-300 mx-1"></div>

      <button
        type="button"
        onClick={addLink}
        className={toggleBtnClass(editor.isActive('link'))}
        title="Add Link"
      >
        <LinkIcon size={18} />
      </button>

      <button
        type="button"
        onClick={addImage}
        className="p-2 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100 flex items-center gap-1"
        title="Add Image via Link"
      >
        <LinkIcon size={18} className="text-primary" />
        <span className="text-[10px] font-bold">IMG</span>
      </button>

      <div className="w-px h-6 bg-neutral-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    initialValue: string;
    onSave: (val: string) => void;
    showUpload?: boolean;
  }>({
    isOpen: false,
    title: '',
    placeholder: '',
    initialValue: '',
    onSave: () => {},
    showUpload: false,
  })

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
      
      const { data } = await axiosClient.post('/upload/image', formData, {
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
    promptConfig.onSave(promptValue)
    setPromptConfig(prev => ({ ...prev, isOpen: false }))
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }: any) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] max-w-none p-4 bg-white rounded-b-xl [&_ul]:list-disc [&_ol]:list-decimal [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold',
      },
    },
  })

  // Synchronize content when it changes externally (e.g. loading edit data)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="relative border border-neutral-200 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <MenuBar 
        editor={editor} 
        onOpenPrompt={(config) => setPromptConfig({ ...config, isOpen: true })} 
      />
      <EditorContent editor={editor} />

      <Dialog open={promptConfig.isOpen} onOpenChange={(open) => setPromptConfig(prev => ({ ...prev, isOpen: open }))}>
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
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={promptConfig.placeholder}
                className="w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePrompt()
                  }
                }}
              />
            </div>

            {promptConfig.showUpload && (
              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-400 font-bold tracking-widest">or</span>
                </div>
              </div>
            )}

            {promptConfig.showUpload && (
              <div className="flex justify-center pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-xl border-dashed border-neutral-300 hover:border-primary hover:bg-neutral-50 gap-2 font-bold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Upload size={16} className="text-primary" />
                  )}
                  {isUploading ? 'Uploading Media...' : 'Browse Local Media'}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-end border-t pt-4">
            <Button
              type="button"
              variant="secondary"
              className="px-6 rounded-xl font-bold"
              onClick={() => setPromptConfig(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="px-8 rounded-xl font-bold"
              onClick={handleSavePrompt}
              disabled={isUploading}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RichTextEditor
