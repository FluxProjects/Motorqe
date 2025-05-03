// components/dashboard/ActivityFeed.tsx
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { 
  Message, 
  CarListing, 
  Favorite,
  Notification
} from "@shared/schema";
import { 
  Bell, 
  Eye, 
  Heart, 
  Mail,
  ArrowRight 
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type ActivityItem = {
  id: string;
  type: 'message' | 'view' | 'favorite' | 'notification';
  title: string;
  description: string;
  icon: React.ReactNode;
  timestamp: Date;
  link?: string;
  read: boolean;
};

export function ActivityFeed({ limit = 5 }: { limit?: number }) {
  const { t } = useTranslation();
  const auth = useAuth();

  // Fetch all activity data
  const { data: messages } = useQuery<Message[]>({
    queryKey: ['messages', auth.user?.id],
    queryFn: () => fetch(`/api/messages/${auth.user?.id}`).then(res => res.json()),
    enabled: !!auth.user?.id
  });

  const { data: viewedListings } = useQuery<CarListing[]>({
    queryKey: ['viewed-listings', auth.user?.id],
    queryFn: () => fetch(`/api/user-activity/views/${auth.user?.id}`).then(res => res.json()),
    enabled: !!auth.user?.id
  });

  const { data: favorites } = useQuery<Favorite[]>({
    queryKey: ['favorites', auth.user?.id],
    queryFn: () => fetch(`/api/favorites/${auth.user?.id}`).then(res => res.json()),
    enabled: !!auth.user?.id
  });

  const { data: notifications } = useQuery<Message[]>({
    queryKey: ['notifications', auth.user?.id],
    queryFn: () => fetch(`/api/user-notifications/${auth.user?.id}`).then(res => res.json()),
    enabled: !!auth.user?.id
  });

  // Transform data into activity items
  const activityItems: ActivityItem[] = [
    ...(messages?.map(msg => ({
      id: `msg-${msg.id}`,
      type: 'message' as const,
      title: t('activity.newMessage'),
      description: msg.content.length > 50 
        ? `${msg.content.substring(0, 50)}...` 
        : msg.content,
      icon: <Mail size={16} className="text-blue-500" />,
      timestamp: msg?.createdAt ? new Date(msg.createdAt) : new Date(), // Ensures a valid Date object
      link: `/messages/${msg.id}`,
      read: msg.status === 'read'
    })) || []),  

    ...(viewedListings?.map(listing => ({
      id: `view-${listing.id}`,
      type: 'view' as const,
      title: t('activity.listingViewed'),
      description: listing.title,
      icon: <Eye size={16} className="text-green-500" />,
      timestamp: listing?.createdAt ? new Date(listing.createdAt) : new Date(), // Assuming updatedAt tracks last view
      link: `/cars/${listing.id}`,
      read: true
    })) || []),

    ...(favorites?.map(fav => ({
      id: `fav-${fav.id}`,
      type: 'favorite' as const,
      title: t('activity.newFavorite'),
      description: t('activity.listingFavorited'),
      icon: <Heart size={16} className="text-red-500" />,
      timestamp: fav?.createdAt ? new Date(fav.createdAt) : new Date(),
      link: `/cars/${fav.carId}`,
      read: true
    })) || []),

    ...(notifications?.map(notif => ({
      id: `notif-${notif.id}`,
      type: 'notification' as const,
      title: notif.title,
      description: notif.content,
      icon: <Bell size={16} className="text-yellow-500" />,
      timestamp: new Date(notif.createdAt),
      link: notif.link,
      read: notif.status === 'read'
    })) || [])
  ]
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, limit);

  const isLoading = !messages || !viewedListings || !favorites || !notifications;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{t('activity.recentActivity')}</h3>
      </div>
      
      <div className="divide-y">
        {isLoading ? (
          Array(limit).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            </div>
          ))
        ) : activityItems.length > 0 ? (
          activityItems.map((activity) => (
            <div 
              key={activity.id} 
              className={`p-4 hover:bg-muted/50 ${!activity.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  {activity.link && (
                    <Link href={activity.link}>
                      <button className="mt-2 text-xs flex items-center text-primary hover:underline">
                        {t('common.viewDetails')} <ArrowRight size={14} className="ml-1" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            {t('activity.noActivities')}
          </div>
        )}
      </div>

      {activityItems.length > 0 && (
        <div className="p-4 border-t text-center">
          <Link href="/activity">
            <button className="text-sm text-primary hover:underline">
              {t('common.viewAll')}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}