// ManageBlogs.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { BlogPost, InsertBlogPost } from "@shared/schema";
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
  Calendar,
  X,
  ImageIcon,
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
import { useEditor, EditorContent, useCurrentEditor, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageUpload from "@/components/ui/image-upload";
import { roleMapping } from "@shared/permissions";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";

const ManageBlogs = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch blog posts
  const {
    data: blogPosts = [],
    isLoading,
    refetch,
  } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog-posts");
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (post: InsertBlogPost | BlogPost) => {
      const isUpdate = "id" in post && post.id > 0;
      const url = isUpdate 
        ? `/api/blog-posts/${post.id}`
        : "/api/blog-posts";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error("Failed to save blog post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setIsDialogOpen(false);
      setCurrentPost(null);
      setIsEditing(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete blog post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setIsDeleteDialogOpen(false);
      setCurrentPost(null);
    },
  });

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateNew = () => {
    setCurrentPost({
      id: 0,
      title: "",
      titleAr: "",
      content: "",
      contentAr: "",
      excerpt: "",
      excerptAr: "",
      featuredImage: "",
      authorId: user?.id || 0,
      authorName: user?.name || "",
      status: "draft",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: "",
      metaTitle: "",
      metaDescription: "",
      tags: [],
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setCurrentPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!currentPost) return;
    saveMutation.mutate(currentPost);
  };

  const handleImageUpload = (url: string) => {
    if (currentPost) {
      setCurrentPost({
        ...currentPost,
        featuredImage: url,
      });
    }
  };

  const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const editor = useEditor({
      extensions: [StarterKit],
      content: value,
      onUpdate({ editor }) {
        onChange(editor.getHTML());
      },
    });

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
                    {t("admin.manageBlogPosts")}
                  </h1>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.newBlogPost")}
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
                        placeholder={t("admin.searchBlogPosts")}
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

                {/* Blog Posts Table */}
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <span className="ml-2 text-gray-500">
                        {t("common.loading")}
                      </span>
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-200 border-b">
                          <TableHead className="text-gray-700">Image</TableHead>
                          <TableHead className="text-gray-700">
                            <button
                              className="flex items-center"
                              onClick={() => {}}
                            >
                              Title
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="text-gray-700">Author</TableHead>
                          <TableHead className="text-gray-700">Status</TableHead>
                          <TableHead className="text-gray-700">Published</TableHead>
                          <TableHead className="text-right text-gray-600">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPosts.map((post) => (
                          <TableRow
                            key={post.id}
                            className="hover:bg-gray-50 border-b"
                          >
                            <TableCell>
                              {post.featuredImage ? (
                                <div className="w-16 h-16 rounded-md overflow-hidden">
                                  <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-gray-800">
                              {post.title}
                            </TableCell>
                            <TableCell className="text-gray-800">
                              {post.authorName}
                            </TableCell>
                            <TableCell>
                              {post.status === "published" ? (
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
                              {post.publishedAt}
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
                                    onClick={() => handleView(post)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEdit(post)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 hover:bg-red-100"
                                    onClick={() => handleDelete(post)}
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
                      <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noBlogPostsFound")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Post Editor/Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? currentPost?.id
                  ? t("admin.editBlogPost")
                  : t("admin.createBlogPost")
                : t("admin.viewBlogPost")}
            </DialogTitle>
          </DialogHeader>
          {currentPost && (
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">العربية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={currentPost.title}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          title: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={currentPost.slug}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          slug: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="blog-post-title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={currentPost.excerpt || ""}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          excerpt: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    {isEditing ? (
                      <RichTextEditor
                        value={currentPost.content}
                        onChange={(value) =>
                          setCurrentPost({
                            ...currentPost,
                            content: value,
                          })
                        }
                      />
                    ) : (
                      <div
                        className="prose max-w-none p-3 border rounded"
                        dangerouslySetInnerHTML={{ __html: currentPost.content }}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={currentPost.metaTitle || ""}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          metaTitle: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={currentPost.metaDescription || ""}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          metaDescription: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleAr">العنوان</Label>
                    <Input
                      id="titleAr"
                      value={currentPost.titleAr || ""}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          titleAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excerptAr">ملخص</Label>
                    <Textarea
                      id="excerptAr"
                      value={currentPost.excerptAr || ""}
                      onChange={(e) =>
                        setCurrentPost({
                          ...currentPost,
                          excerptAr: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contentAr">المحتوى</Label>
                    {isEditing ? (
                      <RichTextEditor
                        value={currentPost.contentAr || ""}
                        onChange={(value) =>
                          setCurrentPost({
                            ...currentPost,
                            contentAr: value,
                          })
                        }
                      />
                    ) : (
                      <div
                        className="prose max-w-none p-3 border rounded"
                        dangerouslySetInnerHTML={{ __html: currentPost.contentAr || "" }}
                        dir="rtl"
                      />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  {isEditing ? (
                    <ImageUpload
                      currentImage={currentPost.featuredImage}
                      onUploadComplete={handleImageUpload}
                    />
                  ) : currentPost.featuredImage ? (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <img
                        src={currentPost.featuredImage}
                        alt="Featured preview"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
                      <span className="text-gray-500">No featured image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={currentPost.status === "published"}
                    onCheckedChange={(checked) =>
                      setCurrentPost({
                        ...currentPost,
                        status: checked ? "published" : "draft",
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="status">
                    {currentPost.status === "published" ? "Published" : "Draft"}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!isEditing}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {currentPost.publishedAt ? (
                          format(new Date(currentPost.publishedAt), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={new Date(currentPost.publishedAt)}
                        onSelect={(date) =>
                          date &&
                          setCurrentPost({
                            ...currentPost,
                            publishedAt: date,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={currentPost.tags?.join(", ") || ""}
                    onChange={(e) =>
                      setCurrentPost({
                        ...currentPost,
                        tags: e.target.value.split(",").map(tag => tag.trim()),
                      })
                    }
                    disabled={!isEditing}
                    placeholder="tag1, tag2, tag3"
                  />
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
            <DialogTitle>{t("admin.confirmDeleteBlogPost")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {t("admin.deleteBlogPostWarning", { title: currentPost?.title })}
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
                if (currentPost) deleteMutation.mutate(currentPost.id);
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

export default ManageBlogs;