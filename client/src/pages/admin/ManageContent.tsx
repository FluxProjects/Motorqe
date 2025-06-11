// StaticContent.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { StaticContent, InsertStaticContent } from "@shared/schema";
import {
  ArrowUpDown,
  BoldIcon,
  Check,
  Edit,
  Eye,
  ItalicIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users2,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useEditor, EditorContent, EditorProvider, useCurrentEditor, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit'
import { roleMapping } from "@shared/permissions";

const ManageContent = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<StaticContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch static content
  const {
    data: contentData = [],
    isLoading,
    refetch,
  } = useQuery<StaticContent[]>({
    queryKey: ["static-content"],
    queryFn: async () => {
      const res = await fetch("/api/static-content");
      if (!res.ok) throw new Error("Failed to fetch static content");
      return res.json();
    },
  });

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (content: InsertStaticContent | StaticContent) => {
      const isUpdate = "id" in content && content.id > 0;
const url = isUpdate 
  ? `/api/static-content/${content.id}`
  : "/api/static-content";
const method = isUpdate ? "PUT" : "POST";

      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error("Failed to save content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["static-content"] });
      setIsDialogOpen(false);
      setCurrentContent(null);
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/static-content/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["static-content"] });
      setIsDeleteDialogOpen(false);
      setCurrentContent(null);
    },
  });

  // Filter content
  const filteredContent = contentData.filter((content) => {
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      content.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateNew = () => {
    setCurrentContent({
      id: 0,
      key: "",
      title: "",
      titleAr: "",
      content: "",
      contentAr: "",
      author: user?.id || 0,
      status: "draft",
      placement: 'both',
      fullWidth: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (content: StaticContent) => {
    setCurrentContent(content);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (content: StaticContent) => {
    setCurrentContent(content);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (content: StaticContent) => {
    setCurrentContent(content);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!currentContent) return;
    saveMutation.mutate(currentContent);
  };

  const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const editor = useEditor({
      extensions: [StarterKit],
      content: value,
      onUpdate({ editor }) {
        onChange(editor.getHTML());
      },
    });

    // Sync editor content when `value` prop changes
    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, false);
      }
    }, [value, editor]);

    return (
      <div>
        <EditorToolbar />
        {editor && (
          <>
            <BubbleMenu editor={editor} className="bg-white p-1 shadow-lg border rounded-md flex gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
              >
                <BoldIcon />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
              >
                <ItalicIcon />
              </button>
            </BubbleMenu>

            <FloatingMenu editor={editor} className="bg-white p-1 shadow-lg border rounded-md flex gap-1">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
              >
                H1
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
              >
                H2
              </button>
            </FloatingMenu>
          </>
        )}
        <EditorContent editor={editor} />
      </div>
    );
  };

  const EditorToolbar = () => {
    const { editor } = useCurrentEditor()

    if (!editor) return null

    return (
      <div className="flex flex-wrap gap-1 p-1 border-b">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <BoldIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <ItalicIcon />
        </button>
        {/* Add more toolbar buttons as needed */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="hidden md:block">
              {user?.roleId && (
                <DashboardSidebar type={roleMapping[user?.roleId] || "BUYER"} />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {t("admin.manageStaticContent")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.newContent")}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-white bg-orange-500 hover:bg-orange-700 hover:text-white"
                      onClick={() => refetch()}
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      {t("common.refresh")}
                    </Button>
                  </div>
                </div>

                {/* Search & Filters */}
                <div className="mt-4 mb-6 bg-neutral-50 border border-orange-300 rounded-lg shadow p-4">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex gap-3 mb-4"
                  >
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={t("admin.searchContent")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-400 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      {t("common.reset")}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Select
                        value={statusFilter}
                        onValueChange={(value: "all" | "draft" | "published") =>
                          setStatusFilter(value)
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder={t("admin.filterByStatus")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-gray-800">
                          <SelectItem value="all">
                            {t("admin.allStatuses")}
                          </SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredContent.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">
                            <button
                              className="flex items-center"
                              onClick={() => {}}
                            >
                              Key
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="text-gray-700">Title</TableHead>
                          <TableHead className="text-gray-700">Placement</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-gray-700">Updated</TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContent.map((content) => (
                          <TableRow
                            key={content.id}
                            className="hover:bg-gray-50 border-b"
                          >
                            <TableCell className="font-medium text-gray-800">
                              {content.key}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {content.title}
                            </TableCell>
                            <TableCell className="text-gray-800">{content.placement}</TableCell>
                            <TableCell>
                              {content.status === "published" ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Published
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Draft
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              {new Date(content.updated_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-white border border-gray-300 text-gray-800"
                                >
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleView(content)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEdit(content)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDelete(content)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Users2 className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noContentFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? currentContent?.id
                  ? t("admin.editContent")
                  : t("admin.createContent")
                : t("admin.viewContent")}
            </DialogTitle>
          </DialogHeader>
          {currentContent && (
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">العربية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Key (unique identifier)</Label>
                    <Input
                      id="key"
                      value={currentContent.key}
                      onChange={(e) =>
                        setCurrentContent({
                          ...currentContent,
                          key: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="about-us, terms, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={currentContent.title}
                      onChange={(e) =>
                        setCurrentContent({
                          ...currentContent,
                          title: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    {isEditing ? (
                      <RichTextEditor
                        value={currentContent.content}
                        onChange={(value) =>
                          setCurrentContent({
                            ...currentContent,
                            content: value,
                          })
                        }
                      />
                    ) : (
                      <div
                        className="prose max-w-none p-3 border rounded"
                        dangerouslySetInnerHTML={{ __html: currentContent.content }}
                      />
                    )}
                  </div>
                  
                </TabsContent>
                
                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleAr">العنوان</Label>
                    <Input
                      id="titleAr"
                      value={currentContent.titleAr || ""}
                      onChange={(e) =>
                        setCurrentContent({
                          ...currentContent,
                          titleAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contentAr">المحتوى</Label>
                    {isEditing ? (
                      <RichTextEditor
                        value={currentContent.contentAr || ""}
                        onChange={(value) =>
                          setCurrentContent({
                            ...currentContent,
                            contentAr: value,
                          })
                        }
                      />
                    ) : (
                      <div
                        className="prose max-w-none p-3 border rounded"
                        dangerouslySetInnerHTML={{ __html: currentContent.contentAr || "" }}
                        dir="rtl"
                      />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={currentContent.status === "published"}
                    onCheckedChange={(checked) =>
                      setCurrentContent({
                        ...currentContent,
                        status: checked ? "published" : "draft",
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="status">
                    {currentContent.status === "published" ? "Published" : "Draft"}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement</Label>
                  <select
                    id="placement"
                    value={currentContent.placement || ""}
                    onChange={(e) =>
                      setCurrentContent({
                        ...currentContent,
                        placement: e.target.value as "header" | "footer" | "both",
                      })
                    }
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">Select placement</option>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="fullWidth"
                    checked={currentContent.fullWidth}
                    onCheckedChange={(checked) =>
                      setCurrentContent({
                        ...currentContent,
                        fullWidth: checked,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="fullWidth">Full Width Layout</Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saveMutation.isLoading}
                >
                  {saveMutation.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {t("common.save")}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsDialogOpen(false)}>
                {t("common.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.confirmDeleteContent")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("admin.deleteContentWarning", { title: currentContent?.title })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (currentContent) deleteMutation.mutate(currentContent.id);
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageContent;