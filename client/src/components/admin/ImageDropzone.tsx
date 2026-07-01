import { useRef, useState } from "react";
import type { DragEvent } from "react";

interface ImageDropzoneProps {
  label: string;
  multiple?: boolean;
  /** Existing remote image URLs already saved on the game. */
  existingUrls?: string[];
  /** Currently selected (not-yet-uploaded) files. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting?: (url: string) => void;
}

export function ImageDropzone({
  label,
  multiple = false,
  existingUrls = [],
  files,
  onFilesChange,
  onRemoveExisting,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFiles(incoming: FileList | null) {
    if (!incoming) return;
    const images = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    onFilesChange(multiple ? [...files, ...images] : [images[0]]);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    acceptFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-zinc-300">{label}</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
          isDragging ? "border-white bg-white/5" : "border-zinc-700 text-zinc-400"
        }`}
      >
        <p>Drag & drop or click to upload</p>
        <p className="mt-1 text-xs text-zinc-500">PNG, JPG, WebP up to 8 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => acceptFiles(e.target.files)}
        />
      </div>

      {(existingUrls.length > 0 || files.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {existingUrls.map((url) => (
            <div key={url} className="relative h-16 w-24">
              <img src={url} alt="" className="h-full w-full rounded object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  aria-label="Remove image"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative h-16 w-24">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full rounded object-cover ring-1 ring-white"
              />
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                aria-label="Remove selected image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
