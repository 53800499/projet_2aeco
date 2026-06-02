"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useImageUpload } from "@/hooks/useImageUpload";
import Loader from "@/components/Common/Loader";
import { cn } from "@/lib/utils";

interface ImageFileInputProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
}

export default function ImageFileInput({
  value = "",
  onChange,
  onError,
  label = "Photo de profil",
  hint = "JPG, PNG ou WebP — max. 5 Mo",
  disabled = false,
  className,
  previewClassName,
}: ImageFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  const processFile = useCallback(
    async (file: File | undefined) => {
      if (!file || disabled || uploading) return;

      try {
        const url = await uploadImage(file);
        onChange(url);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Échec de l’envoi de l’image.";
        onError?.(message);
      }
    },
    [disabled, onChange, onError, uploadImage, uploading]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    void processFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = event.dataTransfer.files?.[0];
    void processFile(file);
  };

  const isBusy = disabled || uploading;

  return (
    <div className={cn("grid gap-3", className)}>
      <span className="text-sm font-medium text-midnight_text dark:text-white">
        {label}
      </span>

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-[1fr_auto]",
          previewClassName
        )}>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => !isBusy && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isBusy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-slate-50 hover:border-primary/60 dark:border-dark_border dark:bg-dark_border/20",
            isBusy && "pointer-events-none opacity-60"
          )}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={isBusy}
            onChange={handleInputChange}
            aria-label={label}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader />
              <p className="text-sm text-grey dark:text-white/70">
                Envoi en cours…
              </p>
            </div>
          ) : (
            <>
              <Icon
                icon="mdi:cloud-upload-outline"
                className="text-3xl text-primary"
              />
              <p className="mt-2 text-sm font-medium text-midnight_text dark:text-white">
                Cliquez ou glissez une image ici
              </p>
              <p className="mt-1 text-xs text-grey dark:text-white/60">{hint}</p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-border bg-slate-100 dark:border-dark_border dark:bg-dark_border/40">
            {value ? (
              <img
                src={value}
                alt="Aperçu"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-grey dark:text-white/50">
                Aucune photo
              </div>
            )}
          </div>
          {value && !isBusy && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="text-xs font-medium text-red-500 hover:underline">
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
