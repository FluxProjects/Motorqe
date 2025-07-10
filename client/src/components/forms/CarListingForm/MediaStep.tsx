import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { StepProps } from "@shared/schema";
import MultiImageUpload from "@/components/ui/multi-image-upload";
import { useAuth } from "@/contexts/AuthContext";

export function MediaStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const { user } = useAuth();

  const [files, setFiles] = useState<(File | string)[]>(() => {
    if (!Array.isArray(data?.media)) return [];
    return data.media.map(item => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "path" in item) return item.path;
      console.warn("Unexpected media item format", item);
      return "";
    });
  });

  const [interiorFiles, setInteriorFiles] = useState<(File | string)[]>(() => {
    if (!Array.isArray(data?.interiorImages)) return [];
    return data.interiorImages.map(item => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "path" in item) return item.path;
      console.warn("Unexpected interior media item format", item);
      return "";
    });
  });

  const [images360Files, setImages360Files] = useState<(File | string)[]>(() => {
    if (!Array.isArray(data?.images360)) return [];
    return data.images360.map(item => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "path" in item) return item.path;
      console.warn("Unexpected 360 media item format", item);
      return "";
    });
  });

  const previewUrls = useMemo(() => files.map(file => typeof file === "string" ? file : URL.createObjectURL(file)), [files]);
  const interiorPreviewUrls = useMemo(() => interiorFiles.map(file => typeof file === "string" ? file : URL.createObjectURL(file)), [interiorFiles]);
  const images360PreviewUrls = useMemo(() => images360Files.map(file => typeof file === "string" ? file : URL.createObjectURL(file)), [images360Files]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({
      media: files.filter(file => typeof file === "string") as string[],
      ...(user?.roleId > 2 && {
        interiorImages: interiorFiles.filter(file => typeof file === "string") as string[],
      }),
      ...(user?.roleId > 6 && {
        images360: images360Files.filter(file => typeof file === "string") as string[],
      })
    });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Primary Images */}
      <div>
        <Label>Upload Images (Max {data.package?.photoLimit || 20})*</Label>
        <MultiImageUpload
          currentImages={previewUrls}
          maxImages={data.package?.photoLimit || 20}
          onUploadComplete={setFiles}
        />
      </div>

      {/* Interior Images (roleId > 2) */}
      {user?.roleId > 2 && (
        <div>
          <Label>Upload Interior Images (Max {data.package?.photoLimit || 10})</Label>
          <MultiImageUpload
            currentImages={interiorPreviewUrls}
            maxImages={data.package?.photoLimit || 10}
            onUploadComplete={setInteriorFiles}
          />
        </div>
      )}

      {/* 360 Images (roleId > 6) */}
      {user?.roleId > 6 && (
        <div>
          <Label>Upload 360° Images (Max 20)</Label>
          <MultiImageUpload
            currentImages={images360PreviewUrls}
            maxImages={20}
            onUploadComplete={setImages360Files}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" className="bg-blue-900 flex items-center gap-2" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button type="submit" disabled={files.length === 0} className="bg-orange-500 flex items-center gap-2">
          Next: Review
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

