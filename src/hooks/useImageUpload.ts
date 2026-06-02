"use client";

import { useCallback, useState } from "react";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format accepté : JPG, PNG, WebP ou GIF.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `L’image ne doit pas dépasser ${MAX_SIZE_MB} Mo.`;
  }
  return null;
};

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible d’envoyer l’image.");
      }

      return data.url as string;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploadImage, uploading };
};
