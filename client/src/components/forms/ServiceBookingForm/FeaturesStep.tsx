// src/components/listings/FeaturesStep.tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StepProps } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { CarFeature } from '@shared/schema';
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

export function FeaturesStep({ listingId, data, updateData, nextStep, prevStep }: StepProps) {
  const { setValue, watch } = useFormContext();
  const featuresValue: string[] = watch('features') || [];

  console.log('Component Rendered');
  console.log('Props:', { listingId, data });

  // Fetch all available features
  const { data: features = [] } = useQuery<CarFeature[]>({
    queryKey: ['all-car-features'],
    queryFn: async () => {
      const res = await fetch('/api/car-features');
      if (!res.ok) throw new Error('Failed to fetch features');
      const result = await res.json();
      console.log('Fetched all features:', result);
      return result;
    },
  });

  // Fetch listing-specific features if in edit mode
  const { data: listingFeatures = [], isLoading } = useQuery<CarFeature[]>({
    queryKey: ['car-listing-features', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const res = await fetch(`/api/car-listings/${listingId}/features`);
      if (!res.ok) throw new Error('Failed to fetch listing features');
      const result = await res.json();
      console.log(`Fetched features for listing ${listingId}:`, result);
      return result;
    },
    enabled: !!listingId,
  });

  // Initialize form with existing features
  useEffect(() => {
    if (!isLoading && listingFeatures.length > 0) {
      const initialFeatures = listingFeatures.map(f => f.id.toString());
      console.log('Setting initial features in form:', initialFeatures);
      setValue('features', initialFeatures);
    }
  }, [isLoading, listingFeatures, setValue]);

  const toggleFeature = (featureId: string) => {
    const newFeatures = featuresValue.includes(featureId)
      ? featuresValue.filter(id => id !== featureId)
      : [...featuresValue, featureId];

    console.log(`Toggling feature ${featureId}`);
    console.log('New feature selection:', newFeatures);

    setValue('features', newFeatures, { shouldValidate: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting features:', featuresValue);
    updateData({ features: featuresValue });
    nextStep();
  };

  if (isLoading) return <div>Loading features...</div>;  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-medium">Select Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features?.map(feature => (
          <div key={feature.id} className="flex items-center space-x-2">
            <Checkbox
              id={`feature-${feature.id}`}
              checked={featuresValue.includes(feature.id.toString())}
              onCheckedChange={() => toggleFeature(feature.id.toString())}
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