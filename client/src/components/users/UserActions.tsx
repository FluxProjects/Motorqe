// components/users/UserActions.tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Mail, Shield, User2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { User } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface UserActionsProps {
  user: User;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function UserActions({ user, onEdit, onDelete }: UserActionsProps) {
  const { t } = useTranslation();
  const auth = useAuth();
  const [, navigate] = useLocation();


  const handleSendMessage = () => {
    navigate(`/messages/new?to=${user.id}`);
  };

  const handleChangeRole = () => {
    // Implement role change logic
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {auth.user?.id !== user.id && (
          <DropdownMenuItem onClick={handleSendMessage}>
            <Mail className="mr-2" size={14} />
            {t('user.actions.sendMessage')}
          </DropdownMenuItem>
        )}

        {auth.user?.role === 'admin' && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2" size={14} />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleChangeRole}>
              <Shield className="mr-2" size={14} />
              {t('user.actions.changeRole')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2" size={14} />
              {t('common.delete')}
            </DropdownMenuItem>
          </>
        )}

        {auth.user?.id === user.id && (
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User2 className="mr-2" size={14} />
            {t('user.actions.viewProfile')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}