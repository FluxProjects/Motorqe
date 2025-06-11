import { BannerAd, BlogPost } from "@shared/schema";
import React from "react";



interface BlogPageProps {
  posts: BlogPost[];
  bannerAds: BannerAd[]; // You can cycle through ads if you want multiple
}

type ContentItem =
  | { type: "post"; data: BlogPost }
  | { type: "banner"; data: BannerAd };

export const BlogPosts: React.FC<BlogPageProps> = ({ posts, bannerAds }) => {
  // Separate banners by position
  const topBanner = bannerAds.find(ad => ad.position === "top");
  const bottomBanner = bannerAds.find(ad => ad.position === "bottom");
  const middleBanners = bannerAds.filter(ad => ad.position !== "top" && ad.position !== "bottom");

  // Helper to cycle through middle banners
  const getMiddleBannerForIndex = (index: number) => {
    if (middleBanners.length === 0) return null;
    return middleBanners[index % middleBanners.length];
  };

  // Compose content with top banner, posts + middle banners, and bottom banner
  const contentWithAds: ContentItem[] = [];

  // Add top banner if exists
  if (topBanner) {
    contentWithAds.push({ type: "banner", data: topBanner });
  }

  posts.forEach((post, i) => {
    contentWithAds.push({ type: "post", data: post });

    // Insert middle banner after every 3 posts
    if ((i + 1) % 3 === 0) {
      const bannerAd = getMiddleBannerForIndex(Math.floor(i / 3));
      if (bannerAd) {
        contentWithAds.push({ type: "banner", data: bannerAd });
      }
    }
  });

  // Add bottom banner if exists
  if (bottomBanner) {
    contentWithAds.push({ type: "banner", data: bottomBanner });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentWithAds.map((item, idx) => {
          if (item.type === "post") {
            const post = item.data as BlogPost;
            return (
              <article
                key={`post-${post.id}`}
                className="bg-white rounded shadow hover:shadow-lg transition p-4 flex flex-col"
              >
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="rounded mb-4 object-cover h-48 w-full"
                />
                <h2 className="text-xl font-semibold mb-2">{post.title || post.title_ar}</h2>
                <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
                <div className="text-sm text-gray-400">
                  <span>{post.author}</span> &bull; <span>{post.created_at}</span>
                </div>
              </article>
            );
          } else if (item.type === "banner") {
            const ad = item.data as BannerAd;
            return (
              <a
                key={`banner-${ad.id}`}
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-full block rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full max-h-[350px] object-cover rounded-3xl shadow-sm"
                />
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

