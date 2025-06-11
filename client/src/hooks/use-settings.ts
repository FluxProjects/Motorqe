// hooks/use-settings.ts
import { useQuery } from "@tanstack/react-query";

export const useSettings = () => {
  return useQuery({
    queryKey: ["general-settings"],
    queryFn: () => fetch("/api/settings").then((res) => res.json()),
  });
};
