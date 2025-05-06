import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { roleSchema, roleMapping, Role } from '@shared/permissions';

type UserRole = z.infer<typeof roleSchema>;

interface SidebarProps {
  type: UserRole;
}

const DashboardSidebar = ({ type }: SidebarProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location] = useLocation();
  
   // Map Role (string) to Links
   const linksMapping: Record<Role, { href: string; label: string; icon: string }[]> = {
    BUYER: [
      { href: '/buyer-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/buyer-dashboard/listings', label: t('buyer.myListings'), icon: 'ri-car-line' },
      { href: '/buyer-dashboard/messages', label: t('common.messages'), icon: 'ri-message-3-line' },
      { href: '/buyer-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-line' },
      { href: '/buyer-dashboard/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SELLER: [
      { href: '/seller-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/seller-dashboard/listings', label: t('seller.myListings'), icon: 'ri-car-line' },
      { href: '/seller-dashboard/messages', label: t('common.messages'), icon: 'ri-message-3-line' },
      { href: '/seller-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-line' },
      { href: '/seller-dashboard/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SHOWROOM_BASIC: [
      { href: '/showroom-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/showroom-dashboard/listings', label: t('showroom.manageListings'), icon: 'ri-car-line' },
      { href: '/showroom-dashboard/messages', label: t('common.messages'), icon: 'ri-message-3-line' },
      { href: '/showroom-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-line' },
      { href: '/showroom-dashboard/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SHOWROOM_PREMIUM: [
      { href: '/showroom-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/showroom-dashboard/listings', label: t('showroom.manageListings'), icon: 'ri-car-line' },
      { href: '/showroom-dashboard/messages', label: t('common.messages'), icon: 'ri-message-3-line' },
      { href: '/showroom-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-line' },
      { href: '/showroom-dashboard/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    MODERATOR: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-message-3-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SENIOR_MODERATOR: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-message-3-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    ADMIN: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-message-3-line' },
      { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-line' },
      { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-line' },
      { href: '/admin/content', label: t('admin.cms'), icon: 'ri-pages-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SUPER_ADMIN: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-message-3-line' },
      { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-line' },
      { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-line' },
      { href: '/admin/content', label: t('admin.cms'), icon: 'ri-pages-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
  };

  //const role = roleMapping[user.roleId] ?? 'BUYER'; // fallback if invalid
  const role = roleMapping?.[Number(user?.roleId)] ?? null;


  const links = linksMapping[role];

  const getBackgroundColor = () => {
    switch (type) {
      case 'BUYER':
        return 'bg-neutral-50';
      case 'SELLER':
        return 'bg-neutral-800 text-white';
      case 'SHOWROOM_BASIC':
      case 'SHOWROOM_PREMIUM':
        return 'bg-green-800 text-white';
      case 'MODERATOR':
      case 'SENIOR_MODERATOR':
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'bg-slate-900 text-white';
      default:
        return 'bg-neutral-50';
    }
  };

  const getLinkStyles = (isActive: boolean) => {
    const baseStyles = "flex items-center px-3 py-2 rounded-md group";

    if (isActive) {
      return cn(baseStyles, "bg-primary text-white");
    }

    switch (type) {
      case 'BUYER':
        return cn(baseStyles, "text-neutral-700 hover:bg-neutral-100");
      case 'SELLER':
        return cn(baseStyles, "text-neutral-300 hover:bg-neutral-700");
      case 'SHOWROOM_BASIC':
      case 'SHOWROOM_PREMIUM':
        return cn(baseStyles, "text-neutral-300 hover:bg-green-700");
      case 'MODERATOR':
      case 'SENIOR_MODERATOR':
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return cn(baseStyles, "text-neutral-300 hover:bg-slate-800");
      default:
        return cn(baseStyles, "text-neutral-700 hover:bg-neutral-100");
    }
  };

  
  return (
    <div className={`p-6 ${getBackgroundColor()} ${type === 'ADMIN' ? 'min-h-screen' : ''}`}>
      <div className="flex items-center space-x-3 mb-8">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatar} alt={user?.username} />
          <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className={`font-medium ${type !== 'BUYER' ? 'text-white' : ''}`}>
            {user?.firstName || user?.username || 'User'}
          </h3>
          <p className={`text-sm ${type === 'BUYER' ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {type === 'BUYER' 
              ? t('common.buyerDashboard')
              : type === 'SELLER'
                ? t('common.sellerDashboard')
                : type === 'SHOWROOM_BASIC'
                  ? t('common.showroomDashboard')
                  : t('common.adminDashboard')
            }
          </p>
        </div>
      </div>
      
      <nav className="space-y-1">
      {(links || []).map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className={getLinkStyles(location === link.href)}
          >
            <i className={`${link.icon} mr-3 text-lg`}></i>
            <span>{link.label}</span>
            {link.icon && (
              <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                {link.icon}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
