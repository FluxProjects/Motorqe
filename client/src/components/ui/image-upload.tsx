import { useState, useCallback } from "react";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  currentImage?: string;
  onUploadComplete: (url: string) => void;
}

const ImageUpload = ({ currentImage, onUploadComplete }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // components/common/ImageUpload.tsx
const handleFileChange = useCallback(
  async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log("result", result.url);
      onUploadComplete(result.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  },
  [onUploadComplete]
);

  const handleRemoveImage = () => {
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
       <div className="grid">
      {currentImage ? (
        <div className="relative group">
          <div className="rounded-md overflow-hidden border">
            <img
              src={currentImage}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          </div>
          {!isUploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center bg-gray-100 rounded-md border-2 border-dashed border-gray-300 aspect-square">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-gray-500 animate-spin mb-2" />
              <span className="text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex justify-center">
                <label className="cursor-pointer">
                  <span className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    Upload Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" id="file-upload-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;