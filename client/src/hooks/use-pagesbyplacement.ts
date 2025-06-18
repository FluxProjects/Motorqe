import { useEffect, useState } from "react";

type Page = {
  key: string;
  title: string;
};

export function usePagesByPlacement(placement: string) {
  const [pages, setPages] = useState<Page[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/published/static-content/placement/${placement}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPages(data);
          setError(null);
        } else {
          setPages([]);
          setError(data?.message || "Unexpected response");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setPages([]);
        setError("Network error or bad response");
      });
  }, [placement]);

  return { pages, error };
}
