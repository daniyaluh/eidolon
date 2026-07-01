import { useState } from "react";
import type { KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-zinc-300">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5 rounded border border-zinc-700 bg-zinc-950 p-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-zinc-400 hover:text-red-400"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder ?? "Type and press Enter"}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-white outline-none"
        />
      </div>
    </div>
  );
}
