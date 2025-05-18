// src/pages/StaticPage.tsx
import { useEffect, useState } from "react";
import { useParams, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { StaticContent } from "@shared/schema";

interface StaticPageProps {
  keyParam: string;
}

export default function StaticPage({ keyParam }: StaticPageProps) {
  const [match] = useRoute("/page/:key");
  const key = keyParam;
  const [data, setData] = useState<StaticContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/published/static-content/${key}`);
        if (!response.ok) throw new Error("Content not found");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [key]);

  if (loading) return <p className="text-center p-8">Loading...</p>;
  if (!data) return <p className="text-center text-red-600 p-8">Page not found</p>;
  return (
    <div className={`${data?.full_width ? "w-full px-0" : "max-w-7xl px-4 sm:px-6 lg:px-8"} mx-auto py-8`}>
      {data.coverImage && (
        <img src={data.coverImage} alt={data.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      )}
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}
