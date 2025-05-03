// src/components/listings/FeaturesStep.tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { StepProps } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { CarFeature } from '@shared/schema';

export function FeaturesStep({ data, updateData, nextStep, prevStep }: StepProps) {
  const { data: features = [] } = useQuery<CarFeature[]>({
    queryKey: ['car-features'],
    queryFn: () => fetch('/api/car-features').then(res => res.json()),
  });

  const [selectedFeatures, setSelectedFeatures] = useState<number[]>(
    (data?.features || []).map(Number)
  );

  const toggleFeature = (featureId: number) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ features: selectedFeatures.map(String) });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-medium">Select Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features?.map(feature => (
          <div key={feature.id} className="flex items-center space-x-2">
            <Checkbox
              id={`feature-${feature.id}`}
              checked={selectedFeatures.includes(feature.id)}
              onCheckedChange={() => toggleFeature(feature.id)}
            />
            <Label htmlFor={`feature-${feature.id}`}>{feature.name}</Label>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Next: Media</Button>
      </div>
    </form>
  );
}