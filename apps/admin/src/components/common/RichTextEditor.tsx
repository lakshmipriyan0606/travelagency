import { useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { EditorToolbar } from './RichTextEditor/EditorToolbar'
import { EditorLinkModal, PromptConfig } from './RichTextEditor/EditorLinkModal'
import { useEditorConfig } from './RichTextEditor/useEditorConfig'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    isOpen: false, title: '', placeholder: '', initialValue: '', onSave: () => {}, showUpload: false,
  })

  const editor = useEditorConfig(content, onChange)

  return (
    <div className="relative border border-white/[0.12] rounded-xl overflow-visible bg-[var(--ent-surface,#121216)] focus-within:border-[#F8B400] focus-within:shadow-[0_0_0_3px_rgba(248,180,0,0.2)] transition-all">
      <EditorToolbar editor={editor} onOpenPrompt={(config) => setPromptConfig({ ...config, isOpen: true })} />
      <EditorContent editor={editor} />
      <EditorLinkModal promptConfig={promptConfig} setPromptConfig={setPromptConfig} />
    </div>
  )
}

export default RichTextEditor
