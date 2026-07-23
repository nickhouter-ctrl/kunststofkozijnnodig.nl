"use client";

import { useRef } from "react";
import Image from "next/image";
import { Upload, X, FileImage, FileText, AlertCircle } from "lucide-react";

export type Attachment = {
  name: string;
  type: string;
  data: string; // base64
  preview?: string; // data URL for images
  size: number;
};

const MAX_FILES = 5;
const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5MB per file
const ACCEPTED = ".jpg,.jpeg,.png,.webp,.pdf,.heic";

export function FileUpload({
  files,
  onChange,
}: {
  files: Attachment[];
  onChange: (files: Attachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    const newFiles: Attachment[] = [...files];

    for (const file of Array.from(fileList)) {
      if (newFiles.length >= MAX_FILES) break;

      if (file.size > MAX_SIZE) {
        alert(`"${file.name}" is te groot (max 1.5 MB per bestand). Probeer een kleiner bestand.`);
        continue;
      }

      const base64 = await fileToBase64(file);
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

      newFiles.push({
        name: file.name,
        type: file.type,
        data: base64,
        preview,
        size: file.size,
      });
    }

    onChange(newFiles);
  };

  const remove = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-rebu-green", "bg-rebu-green/5"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-rebu-green", "bg-rebu-green/5"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-rebu-green", "bg-rebu-green/5");
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className="cursor-pointer border border-dashed border-rebu-stone bg-rebu-cream/50 p-8 text-center transition-colors hover:border-rebu-green hover:bg-rebu-green/5"
      >
        <Upload className="mx-auto h-8 w-8 text-rebu-green" />
        <p className="mt-3 font-semibold text-ink">
          Klik om bestanden te selecteren
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          of sleep ze hierheen — foto's, tekeningen of PDF's
        </p>
        <p className="mt-2 text-xs text-ink-soft/70">
          Max {MAX_FILES} bestanden, max 1.5 MB per stuk · JPG, PNG, WebP, PDF
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="group relative overflow-hidden border border-ink/10 bg-paper"
            >
              {file.preview ? (
                <div className="relative aspect-square">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-rebu-cream">
                  <FileText className="h-10 w-10 text-rebu-green" />
                </div>
              )}
              <div className="p-2">
                <p className="truncate text-xs font-medium text-ink">{file.name}</p>
                <p className="text-xs text-ink-soft">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Verwijderen"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length >= MAX_FILES && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3" />
          Maximum van {MAX_FILES} bestanden bereikt
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get pure base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
