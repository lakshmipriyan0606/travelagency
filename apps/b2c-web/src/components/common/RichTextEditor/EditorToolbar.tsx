import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Heading1, Heading2, Heading3, Quote,
  Undo, Redo, Link as LinkIcon
} from 'lucide-react'

export const EditorToolbar = ({ editor, onOpenPrompt }: { editor: any, onOpenPrompt: (config: any) => void }) => {
  if (!editor) return null

  const addImage = () => {
    onOpenPrompt({
      title: 'Insert Image', placeholder: 'https://example.com/image.jpg', initialValue: '', showUpload: true,
      onSave: (url: string) => { if (url) editor.chain().focus().setImage({ src: url }).run() }
    })
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href
    onOpenPrompt({
      title: 'Edit Link', placeholder: 'https://example.com', initialValue: previousUrl || '',
      onSave: (url: string) => {
        if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
        else if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    })
  }

  const toggleBtnClass = (isActive: boolean) => `p-2 rounded-md transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-neutral-600 hover:bg-neutral-100'}`

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-20 z-20 rounded-t-xl">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1"><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 size={18} /></button>
      <div className="w-px h-6 bg-neutral-300 mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={toggleBtnClass(editor.isActive('bold'))} title="Bold"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={toggleBtnClass(editor.isActive('italic'))} title="Italic"><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} className={toggleBtnClass(editor.isActive('underline'))} title="Underline"><UnderlineIcon size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={toggleBtnClass(editor.isActive('strike'))} title="Strikethrough"><Strikethrough size={18} /></button>
      <div className="w-px h-6 bg-neutral-300 mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={toggleBtnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left"><AlignLeft size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={toggleBtnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center"><AlignCenter size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={toggleBtnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right"><AlignRight size={18} /></button>
      <div className="w-px h-6 bg-neutral-300 mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toggleBtnClass(editor.isActive('bulletList'))} title="Bullet List"><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toggleBtnClass(editor.isActive('orderedList'))} title="Ordered List"><ListOrdered size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toggleBtnClass(editor.isActive('blockquote'))} title="Quote"><Quote size={18} /></button>
      <div className="w-px h-6 bg-neutral-300 mx-1"></div>
      <button type="button" onClick={addLink} className={toggleBtnClass(editor.isActive('link'))} title="Add Link"><LinkIcon size={18} /></button>
      <button type="button" onClick={addImage} className="p-2 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100 flex items-center gap-1" title="Add Image via Link"><LinkIcon size={18} className="text-primary" /><span className="text-[10px] font-bold">IMG</span></button>
      <div className="w-px h-6 bg-neutral-300 mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-2 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100 disabled:opacity-50" title="Undo"><Undo size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-2 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100 disabled:opacity-50" title="Redo"><Redo size={18} /></button>
    </div>
  )
}
