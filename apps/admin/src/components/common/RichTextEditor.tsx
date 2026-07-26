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
    <div className="relative border border-neutral-200 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <EditorToolbar editor={editor} onOpenPrompt={(config) => setPromptConfig({ ...config, isOpen: true })} />
      <EditorContent editor={editor} />
      <EditorLinkModal promptConfig={promptConfig} setPromptConfig={setPromptConfig} />
    </div>
  )
}

export default RichTextEditor
