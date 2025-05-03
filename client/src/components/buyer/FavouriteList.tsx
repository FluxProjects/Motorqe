// components/buyer/FavouritesList.tsx
import { useQuery } from "@tanstack/react-query";
import CarCard from "../car/CarCard";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function FavouritesList() {
  const { t } = useTranslation();
  const auth = useAuth();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', auth.user?.id],
    queryFn: () => 
      fetch(`/api/favorites/${auth.user?.id}`).then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('favorites.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav: any) => (
          <CarCard key={fav.id} car={fav.car} />
        ))}
        {favorites.length === 0 && (
          <p className="text-muted-foreground">{t('favorites.empty')}</p>
        )}
      </div>
    </div>
  );
}