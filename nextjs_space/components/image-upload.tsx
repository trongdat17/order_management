'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      // Get presigned URL
      const presignedResponse = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          isPublic: true
        })
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, cloudStoragePath } = await presignedResponse.json();

      // Check if Content-Disposition is in signed headers
      const url = new URL(uploadUrl);
      const signedHeaders = url.searchParams.get('X-Amz-SignedHeaders');
      const includesContentDisposition = signedHeaders?.includes('content-disposition');

      // Upload file to S3
      const uploadHeaders: HeadersInit = {
        'Content-Type': file.type
      };

      // Only add Content-Disposition if it's in signed headers
      if (includesContentDisposition) {
        uploadHeaders['Content-Disposition'] = 'attachment';
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: uploadHeaders,
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Complete upload and get file URL
      const completeResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudStoragePath,
          isPublic: true
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const { fileUrl } = await completeResponse.json();

      setPreview(fileUrl);
      onChange(fileUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border-2 border-gray-200">
          <Image
            src={preview}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`w-full aspect-square max-w-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 ${
            disabled || uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
          } transition-colors`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="text-gray-400" size={32} />
              <p className="text-sm text-gray-600">Click to upload image</p>
              <p className="text-xs text-gray-400">Max 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
}
