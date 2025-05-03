import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { StepProps } from '@shared/schema';
import type { PromotionPackage } from '@shared/schema';

export function PromotionStep({ data, updateData, prevStep }: StepProps) {
  const { data: packages = [] } = useQuery<PromotionPackage[]>({
    queryKey: ['promotion-packages'],
    queryFn: () =>
      fetch('/api/promotion-packages?activeOnly=true').then(res => res.json()),
  });

  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    data?.pricing?.packages?.[0]?.id || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = packages.find(pkg => pkg.id === selectedPackageId);
    if (!selected) return;

    updateData({
      pricing: {
        packages: [selected], // save as array
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Boost Your Listing</h3>
        <p className="text-muted-foreground mb-6">
          Select a promotion package to make your listing stand out (optional)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <Card
              key={pkg.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedPackageId === pkg.id
                  ? 'border-2 border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPackageId(pkg.id)}
            >
              <div className="font-semibold">{pkg.name}</div>
              <div className="text-2xl font-bold my-2">${pkg.price}</div>
              <div className="text-sm text-muted-foreground">
                {pkg.durationDays} days
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {pkg.isFeatured && <li>✓ Featured listing</li>}
                <li>✓ {pkg.priority}× more visibility</li>
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" disabled={!selectedPackageId}>
          Submit Listing
        </Button>
      </div>
    </form>
  );
}
