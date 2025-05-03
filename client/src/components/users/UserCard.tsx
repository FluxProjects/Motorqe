// components/users/UserCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { User } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { RoleBadge } from "./RoleBadge";

interface UserCardProps {
  user: User;
  onMessage?: () => void;
}

export function UserCard({ user, onMessage }: UserCardProps) {
  const { t } = useTranslation();
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  return (
    <div className="border rounded-lg p-4 flex items-center gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">
            {user.firstName} {user.lastName}
          </h4>
          <RoleBadge roleId={user.roleId || 1 } />
        </div>
        <p className="text-sm text-muted-foreground">{user.username}</p>
      </div>

      <div className="flex gap-2">
        {onMessage && (
          <Button variant="outline" size="icon" onClick={onMessage}>
            <MessageSquare size={16} />
          </Button>
        )}
        {user.phone && (
          <Button variant="outline" size="icon" asChild>
            <a href={`tel:${user.phone}`}>
              <Phone size={16} />
            </a>
          </Button>
        )}
        <Button variant="outline" size="icon" asChild>
          <a href={`mailto:${user.email}`}>
            <Mail size={16} />
          </a>
        </Button>
      </div>
    </div>
  );
}