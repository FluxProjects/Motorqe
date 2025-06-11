import { useState, useCallback } from "react";
import { Loader2, X, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface MultiImageUploadProps {
  currentImages?: string[];
  maxImages?: number;
  onUploadComplete: (urls: string[]) => void;
}

const MultiImageUpload = ({ 
  currentImages = [], 
  maxImages = 5,
  onUploadComplete 
}: MultiImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      
      if (files.length === 0) return;

      // Check if adding these files would exceed max limit
      if (currentImages.length + files.length > maxImages) {
        setError(`You can upload a maximum of ${maxImages} images`);
        return;
      }

      // Validate each file
      for (const file of files) {
        if (!file.type.match('image.*')) {
          setError('Please upload only image files');
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('Each file must be less than 5MB');
          return;
        }
      }

      setIsUploading(true);
      setError(null);

      try {
        const uploadedUrls: string[] = [];
        
        for (const file of files) {
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
          uploadedUrls.push(result.url);
        }

        // Combine new URLs with existing ones
        const allUrls = [...currentImages, ...uploadedUrls];
        onUploadComplete(allUrls);
      } catch (err) {
        console.error('Upload failed:', err);
        setError('Failed to upload images. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [currentImages, maxImages, onUploadComplete]
  );

  const handleRemoveImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    onUploadComplete(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentImages.map((image, index) => (
          <div key={index} className="relative group">
            <div className="rounded-md overflow-hidden border aspect-square">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {!isUploading && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {currentImages.length < maxImages && (
          <div className="flex items-center justify-center bg-gray-100 rounded-md border-2 border-dashed border-gray-300 aspect-square">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-gray-500 animate-spin mb-2" />
                <span className="text-gray-500">Uploading...</span>
              </div>
            ) : (
              <div className="text-center p-4">
                <label className="cursor-pointer flex flex-col items-center">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-700">
                    Upload Images
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB each
                </p>
                <p className="text-xs text-gray-500">
                  {maxImages - currentImages.length} remaining
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

export default MultiImageUpload;