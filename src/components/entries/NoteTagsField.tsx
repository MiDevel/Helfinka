import type { ChangeEvent, KeyboardEvent } from 'react'
import { useState } from 'react'

import { getSuggestedTags } from '@/lib/noteTags'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NoteTagsFieldProps {
  value: string[]
  onChange: (next: string[]) => void
}

function normalizeTag(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '_')
}

function NoteTagsField({ value, onChange }: NoteTagsFieldProps) {
  const [input, setInput] = useState('')

  const selected = value.map((tag) => normalizeTag(tag))
  const suggestions = getSuggestedTags(selected)

  const handleAdd = () => {
    const normalized = normalizeTag(input)

    if (!normalized) return

    if (!selected.includes(normalized)) {
      onChange([...selected, normalized])
    }

    setInput('')
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAdd()
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleRemove = (tag: string) => {
    onChange(selected.filter((value) => value !== tag))
  }

  const handleSuggestionClick = (tag: string) => {
    if (!selected.includes(tag)) {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Add tag and press Enter (e.g. HEADACHE)"
          className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
        />
        <Button type="button" variant="outline" onClick={handleAdd} className="shrink-0">
          Add
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleRemove(tag)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            >
              <span>{tag}</span>
              <span className="text-muted-foreground">×</span>
            </button>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Suggestions</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs',
                  'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { NoteTagsField }
