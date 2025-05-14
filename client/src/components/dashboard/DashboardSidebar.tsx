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
    { href: '/buyer-dashboard/favourites', label: t('common.myFavourites'), icon: 'ri-heart-line' },  // updated icon
    { href: '/buyer-dashboard/messages', label: t('common.messages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/buyer-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-2-line' },  // updated icon
    { href: '/buyer-dashboard/profile', label: t('common.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  SELLER: [
    { href: '/seller-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/seller-dashboard/listings', label: t('seller.myListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/seller-dashboard/favourites', label: t('seller.myFavourites'), icon: 'ri-heart-line' },  // updated icon
    { href: '/seller-dashboard/messages', label: t('common.messages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/seller-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-2-line' },  // updated icon
    { href: '/seller-dashboard/profile', label: t('common.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  SHOWROOM_BASIC: [
    { href: '/showroom-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/showroom-dashboard/listings', label: t('showroom.manageListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/showroom-dashboard/servicelistings', label: t('showroom.manageServiceListings'), icon: 'ri-service-line' },  // updated icon
    { href: '/showroom-dashboard/servicebookings', label: t('showroom.manageServiceBookings'), icon: 'ri-service-line' },  // updated icon
    { href: '/showroom-dashboard/favourites', label: t('showroom.myFavourites'), icon: 'ri-heart-line' },  // updated icon
    { href: '/showroom-dashboard/messages', label: t('showroom.messages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/showroom-dashboard/settings', label: t('showroom.settings'), icon: 'ri-settings-2-line' },  // updated icon
    { href: '/showroom-dashboard/profile', label: t('showroom.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  SHOWROOM_PREMIUM: [
    { href: '/showroom-dashboard', label: t('showroom.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/showroom-dashboard/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/showroom-dashboard/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },  // updated icon
    { href: '/showroom-dashboard/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },  // updated icon
    { href: '/showroom-dashboard/favourites', label: t('buyer.myFavourites'), icon: 'ri-heart-line' },  // updated icon
    { href: '/showroom-dashboard/messages', label: t('showroom.messages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/showroom-dashboard/settings', label: t('showroom.settings'), icon: 'ri-settings-2-line' },  // updated icon
    { href: '/showroom-dashboard/profile', label: t('showroom.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  MODERATOR: [
    { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  SENIOR_MODERATOR: [
    { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  ADMIN: [
    { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-2-line' },  // updated icon
    { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-2-line' },  // updated icon
    { href: '/admin/content', label: t('admin.cms'), icon: 'ri-pages-line' },  // updated icon
    { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },  // updated icon
  ],
  SUPER_ADMIN: [
    { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
    { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },  // updated icon
    { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },  // updated icon
    { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },  // updated icon
    { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-2-line' },  // updated icon
    { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-2-line' },  // updated icon
    { href: '/admin/content', label: t('admin.cms'), icon: 'ri-pages-line' },  // updated icon
    { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },  // updated icon
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
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
