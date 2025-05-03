// components/notifications/NotificationCenter.tsx
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Message } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export function NotificationCenter() {
  const { t } = useTranslation();
  const auth = useAuth();

  const { data: notifications } = useQuery<Message[]>({
    queryKey: ["notifications", auth.user?.id],
    queryFn: () =>
      fetch(`/api/user-notifications/${auth.user?.id}`).then((res) =>
        res.json()
      ),
    enabled: !!auth.user?.id,
  });

  const unreadCount =
    notifications?.filter((n) => n.status === "unread").length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary rounded-full w-5 h-5 flex items-center justify-center text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-2 border-b">
          <h4 className="font-medium">{t("notifications.title")}</h4>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className="p-3 border-b hover:bg-muted/50"
            >
              <div className="flex justify-between">
                <p className="font-medium">{notification.content}</p>
                <Button variant="ghost" size="sm">
                  <Check size={16} />
                </Button>
              </div>
              {notification.createdAt && (
                <p className="text-sm text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
          {!notifications?.length && (
            <p className="p-4 text-center text-muted-foreground">
              {t("notifications.noNotifications")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
