// src/components/listings/BasicInfoStep.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { StepProps } from '@shared/schema';

export function BasicInfoStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const [formData, setFormData] = useState({
    title: data?.basicInfo?.title || '',
    description: data?.basicInfo?.description || '',
    location: data?.basicInfo?.location || '',
    price: data?.basicInfo?.price || '', // <-- Added price
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 // Inside BasicInfoStep.tsx

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  updateData({ basicInfo: formData }); // ✅ pass the correct data
  nextStep();
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Listing Title*</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g. 2020 Toyota Camry XSE"
        />
      </div>

      <div>
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe your vehicle in detail..."
        />
      </div>
      <div>
        <Label htmlFor="price">Price (QAR)*</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          placeholder="e.g. 15000"
          min={0}
        />
      </div>

      <div>
        <Label htmlFor="location">Location*</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="City, Country"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Next: Specifications</Button>
      </div>
    </form>
  );
}