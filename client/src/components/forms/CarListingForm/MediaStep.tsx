// src/components/listings/MediaStep.tsx
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { StepProps } from "@shared/schema";
import MultiImageUpload from "@/components/ui/multi-image-upload";

export function MediaStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [files, setFiles] = useState<(File | string)[]>(() => {
  if (!Array.isArray(data?.media)) return [];
  return data.media.map(item => {
    if (typeof item === "string") {
      return item;
    }
    if (item && typeof item === "object" && "path" in item) {
      return item.path; // or `item.relativePath` if needed
    }
    console.warn("Unexpected media item format", item);
    return "";
  });
});


  // Convert File objects to object URLs for preview
  const previewUrls = useMemo(() => {
   return files.map(file => {
  if (typeof file === "string") {
    return file;
  }
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  console.warn("Invalid file type in MediaStep previewUrls", file);
  return "";
});
  }, [files]);

  const handleUploadComplete = (urls: string[]) => {
    setFiles(urls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const media = files.filter(file => typeof file === "string") as string[];
    updateData({ media });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Upload Images (Max {data.package?.photoLimit || 20})*</Label>
        <MultiImageUpload
          currentImages={previewUrls}
          maxImages={data.package?.photoLimit || 20}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          className="bg-blue-900 flex items-center gap-2"
          type="button" 
          onClick={prevStep}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button 
          className="bg-orange-500 flex items-center gap-2"
          type="submit" 
          disabled={files.length === 0}
        >
          Next: Review
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}