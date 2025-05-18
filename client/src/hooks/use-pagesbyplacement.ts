import { useEffect, useState } from "react";

type Page = {
  key: string;
  title: string;
};

export function usePagesByPlacement(placement: string) {
  const [pages, setPages] = useState<Page[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Fetching pages for placement: ${placement}`);

    fetch(`/api/published/static-content/placement/${placement}`)
      .then((res) => {
        console.log("Received response:", res);
        return res.json();
      })
      .then((data) => {
        console.log("Parsed JSON data:", data);

        if (Array.isArray(data)) {
          console.log("Setting pages:", data);
          setPages(data);
          setError(null);
        } else {
          console.error("Expected array but got:", data);
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

  console.log("Returning pages and error:", { pages, error });
  return { pages, error };
}
