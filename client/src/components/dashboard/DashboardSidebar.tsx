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

  const role = roleMapping?.[Number(user?.roleId)] ?? null;

  const linksMapping: Record<Role, { href: string; label: string; icon: string }[]> = {
    BUYER: [
      { href: '/buyer-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/buyer-dashboard/favourites', label: t('common.myFavourites'), icon: 'ri-heart-line' },
      { href: '/buyer-dashboard/messages', label: t('common.messages'), icon: 'ri-mail-line' },
      { href: '/buyer-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-2-line' },
      { href: '/buyer-dashboard/profile', label: t('common.profile'), icon: 'ri-user-2-line' },
    ],
    SELLER: [
      { href: '/seller-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/seller-dashboard/listings', label: t('seller.myListings'), icon: 'ri-car-fill' },
      { href: '/seller-dashboard/favourites', label: t('seller.myFavourites'), icon: 'ri-heart-line' },
      { href: '/seller-dashboard/messages', label: t('common.messages'), icon: 'ri-mail-line' },
      { href: '/seller-dashboard/settings', label: t('common.settings'), icon: 'ri-settings-2-line' },
      { href: '/seller-dashboard/profile', label: t('common.profile'), icon: 'ri-user-2-line' },
    ],
    DEALER: [
      { href: '/showroom-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/showroom-dashboard/listings', label: t('showroom.manageListings'), icon: 'ri-car-fill' },
       { href: '/showroom-dashboard/messages', label: t('showroom.messages'), icon: 'ri-mail-line' },
      { href: '/showroom-dashboard/settings', label: t('showroom.settings'), icon: 'ri-settings-2-line' },
      { href: '/showroom-dashboard/profile', label: t('showroom.profile'), icon: 'ri-user-2-line' },
    ],
    GARAGE: [
      { href: '/showroom-dashboard', label: t('showroom.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/showroom-dashboard/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },
      { href: '/showroom-dashboard/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },
      { href: '/showroom-dashboard/messages', label: t('showroom.messages'), icon: 'ri-mail-line' },
      { href: '/showroom-dashboard/settings', label: t('showroom.settings'), icon: 'ri-settings-2-line' },
      { href: '/showroom-dashboard/profile', label: t('showroom.profile'), icon: 'ri-user-2-line' },
    ],
    MODERATOR: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },
    ],
    SENIOR_MODERATOR: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },
    ],
    ADMIN: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },
      { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-2-line' },
      { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-2-line' },
      { href: '/admin/content', label: t('admin.cms'), icon: 'ri-pages-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },
    ],
    SUPER_ADMIN: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-fill' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-service-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-service-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-mail-line' },
      { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-2-line' },
      { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-2-line' },
      { href: '/admin/content', label: t('admin.cms'), icon: 'ri-pages-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-2-line' },
    ],
  };

  const links = linksMapping?.[role];

  const getBackgroundColor = () => {
    switch (type) {
      case 'BUYER': return 'bg-neutral-50';
      case 'SELLER': return 'bg-neutral-900 text-white';
      case 'DEALER': return 'bg-blue-900 text-white';
      case 'GARAGE': return 'bg-green-900 text-white';
      case 'MODERATOR':
      case 'SENIOR_MODERATOR':
      case 'ADMIN':
      case 'SUPER_ADMIN': return 'bg-orange-900 text-white';
      default: return 'bg-blue-900';
    }
  };

  const getLinkStyles = (isActive: boolean) => {
    const base = "flex items-center px-3 py-2 rounded-md group";
    if (isActive) return cn(base, "bg-primary text-white");
    switch (type) {
      case 'BUYER': return cn(base, "text-neutral-700 hover:bg-neutral-100");
      case 'SELLER': return cn(base, "text-white hover:bg-neutral-500");
      case 'DEALER': return cn(base, "text-white hover:bg-blue-500");
      case 'GARAGE': return cn(base, "text-white hover:bg-green-500");
      case 'MODERATOR':
      case 'SENIOR_MODERATOR':
      case 'ADMIN':
      case 'SUPER_ADMIN': return cn(base, "text-white hover:bg-orange-500");
      default: return cn(base, "text-white hover:bg-blue-500");
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
          <p className={`text-sm ${type === 'BUYER' ? 'text-white' : 'text-neutral-50'}`}>
            {role}
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {links?.map(link => {
          const isActive = location === link.href;
          return (
            <Link href={link.href} key={link.href}>
              <a className={getLinkStyles(isActive)}>
                <i className={`${link.icon} mr-2 text-lg`} />
                {link.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
