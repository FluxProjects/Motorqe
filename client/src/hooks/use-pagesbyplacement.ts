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
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPages(data);
          setError(null);
        } else {
          console.error("Expected array but got:", data);
          setPages([]); // ensure fallback to empty list
          setError(data?.message || "Unexpected response");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch pages:", err);
        setPages([]);
        setError("Network error or bad response");
      });
  }, [placement]);

  return { pages, error };
}
