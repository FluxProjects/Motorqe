// src/components/listings/MediaStep.tsx
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { StepProps } from "@shared/schema";

export function MediaStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [files, setFiles] = useState<(File | string)[]>(
    Array.isArray(data?.media) ? data.media : []
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 10));
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ media: files as string[] });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Upload Images (Max 10)*</Label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...getInputProps()} />
          <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">Drag & drop images here, or click to select</p>
          <p className="text-sm text-muted-foreground">
            Recommended size: 1200x800px (up to 10MB each)
          </p>
        </div>
      </div>

      {/* Thumbnail preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={
                  typeof file === "string" ? file : URL.createObjectURL(file)
                }
                alt={`Preview ${index + 1}`}
                className="rounded-md h-32 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" disabled={files.length === 0}>
          Next: Review
        </Button>
      </div>
    </form>
  );
}
