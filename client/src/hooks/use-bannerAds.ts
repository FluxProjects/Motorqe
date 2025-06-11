// hooks/use-settings.ts
import { useQuery } from "@tanstack/react-query";

export const useBannerAds = () => {
  return useQuery({
    queryKey: ["banner-ads"],
    queryFn: () => fetch("/api/banner-ads").then((res) => res.json()),
  });
};
