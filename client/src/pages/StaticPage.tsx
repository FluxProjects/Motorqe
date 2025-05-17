// src/pages/StaticPage.tsx
import { useEffect, useState } from "react";
import { useParams, useRoute } from "wouter";
import { useTranslation } from "react-i18next";

interface StaticContent {
  key: string;
  title: string;
  content: string;
  coverImage?: string;
}

interface StaticPageProps {
  keyParam: string;
}

export default function StaticPage({ keyParam }: StaticPageProps) {
    const [match] = useRoute("/page/:key");
    const key = keyParam;
    const [data, setData] = useState<StaticContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  
  console.log("StaticPage rendered with key:", key);

  
  

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {data.coverImage && (
        <img src={data.coverImage} alt={data.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      )}
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}
