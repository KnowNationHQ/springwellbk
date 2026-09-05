"use client";

import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Camera, X, Loader2 } from "lucide-react";

interface ProfileImageUploadProps {
  userId: string;
  imageId?: string | null;
  firstName: string;
  lastName: string;
  onImageSaved: (imageId: string | null) => void;
  generateUploadUrl: any;
  saveImage: any;
  removeImage?: any;
  size?: "sm" | "md" | "lg";
}

export function ProfileImageUpload({
  userId,
  imageId,
  firstName,
  lastName,
  onImageSaved,
  generateUploadUrl,
  saveImage,
  removeImage,
  size = "md",
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const imageUrl = useQuery(
    api.auth.getImageUrl,
    imageId ? { imageId } : "skip"
  );

  const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";

  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-28 h-28 text-3xl",
    lg: "w-44 h-44 text-5xl",
  };

  const iconSize = size === "sm" ? 14 : 18;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be under 4MB");
      return;
    }
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await saveImage({ userId: userId as any, imageId: storageId });
      onImageSaved(storageId);
      setPreview(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!removeImage) return;
    if (!confirm("Remove profile picture?")) return;
    setUploading(true);
    try {
      await removeImage({ userId: userId as any });
      onImageSaved(null);
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setUploading(false);
    }
  }

  const displaySrc = preview || imageUrl;

  return (
    <div className={`relative group ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#426FB6] text-white font-bold">
          {uploading ? <Loader2 className="animate-spin" size={iconSize + 8} /> : initials}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-wait"
      >
        {uploading ? (
          <Loader2 className="text-white animate-spin" size={iconSize + 4} />
        ) : (
          <Camera className="text-white" size={iconSize + 4} />
        )}
      </button>

      {imageId && removeImage && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <X size={12} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
