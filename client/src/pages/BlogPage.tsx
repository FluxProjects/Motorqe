import { BlogPosts } from "@/components/layout/BlogPosts";
import { useBannerAds } from "@/hooks/use-bannerAds";
import { BlogPost } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";



const BlogPage = () => {
    const { data: posts = [] } = useQuery<BlogPost[]>({
  queryKey: ["/api/blog-posts"],
});

const { data: bannerAds = []} = useBannerAds();
  return (
   <div className="bg-white min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlogPosts posts={posts} bannerAds={bannerAds} />;
    </div>
      
    </div>
  );
};

export default BlogPage;
