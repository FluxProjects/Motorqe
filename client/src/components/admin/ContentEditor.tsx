// components/admin/ContentEditor.tsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaticContent } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function ContentEditor() {
  const { t } = useTranslation();
  const [editingContent, setEditingContent] = useState<StaticContent | null>(null);
  
  const { data: contents, isLoading } = useQuery<StaticContent[]>({
    queryKey: ['static-content'],
    queryFn: () => fetch('/api/static-content').then(res => res.json())
  });

  if (isLoading) {
    return <Loader2 className="animate-spin h-6 w-6" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 space-y-2">
        <h3 className="font-medium">{t('content.selectContent')}</h3>
        <div className="space-y-1">
          {contents?.map(content => (
            <Button
              key={content.key}
              variant={editingContent?.key === content.key ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setEditingContent(content)}
            >
              {content.key}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="md:col-span-3 space-y-4">
        {editingContent ? (
          <>
            <h3 className="font-medium">Editing: {editingContent.key}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Title (EN)</label>
                <Input 
                  value={editingContent.title} 
                  onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1">Content (EN)</label>
                <Textarea
                  value={editingContent.content}
                  onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                  rows={10}
                />
              </div>
              {/* Add fields for Arabic content */}
              <Button>
                <Save className="mr-2 h-4 w-4" />
                {t('common.save')}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">{t('content.selectToEdit')}</p>
        )}
      </div>
    </div>
  );
}