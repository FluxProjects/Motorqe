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

  const role = roleMapping?.[Number(user?.roleId)] ?? 'USER';

  const linksMapping: Record<Role, { href: string; label: string; icon: string }[]> = {
    BUYER: [
      { href: '/buyer-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/buyer-dashboard/messages', label: t('common.messages'), icon: 'ri-mail-line' },
      { href: '/buyer-dashboard/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SELLER: [
      { href: '/seller-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/seller-dashboard/listings', label: t('seller.myListings'), icon: 'ri-car-line' },
      { href: '/seller-dashboard/messages', label: t('common.messages'), icon: 'ri-mail-line' },
      { href: '/seller-dashboard/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    DEALER: [
      { href: '/showroom-dashboard', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/showroom-dashboard/listings', label: t('showroom.manageListings'), icon: 'ri-car-line' },
      { href: '/showroom-dashboard/messages', label: t('showroom.messages'), icon: 'ri-mail-line' },
      { href: '/showroom-dashboard/profile', label: t('showroom.profile'), icon: 'ri-user-line' },
    ],
    GARAGE: [
      { href: '/showroom-dashboard', label: t('showroom.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/showroom-dashboard/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-tools-line' },
      { href: '/showroom-dashboard/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-calendar-check-line' },
      { href: '/showroom-dashboard/messages', label: t('showroom.messages'), icon: 'ri-mail-line' },
      { href: '/showroom-dashboard/profile', label: t('showroom.profile'), icon: 'ri-user-line' },
    ],
    MODERATOR: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-tools-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-calendar-check-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-chat-3-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SENIOR_MODERATOR: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-tools-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-calendar-check-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-chat-3-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    ADMIN: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-tools-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-calendar-check-line' },
      { href: '/admin/inspections', label: t('admin.manageCarInspections'), icon: 'ri-search-eye-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-chat-3-line' },
      { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-settings-line' },
      { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-3-line' },
      { href: '/admin/content', label: t('admin.cms'), icon: 'ri-layout-text-window-line' },
      { href: '/admin/profile', label: t('common.profile'), icon: 'ri-user-line' },
    ],
    SUPER_ADMIN: [
      { href: '/admin', label: t('common.dashboard'), icon: 'ri-dashboard-line' },
      { href: '/admin/listings', label: t('admin.manageListings'), icon: 'ri-car-line' },
      { href: '/admin/servicelistings', label: t('admin.manageServiceListings'), icon: 'ri-tools-line' },
      { href: '/admin/servicebookings', label: t('admin.manageServiceBookings'), icon: 'ri-calendar-check-line' },
      { href: '/admin/inspections', label: t('admin.manageCarInspections'), icon: 'ri-search-eye-line' },
      { href: '/admin/promotions', label: t('admin.managePromotionPackages'), icon: 'ri-price-tag-3-line' },
      { href: '/admin/messages', label: t('admin.manageMessages'), icon: 'ri-chat-3-line' },
      { href: '/admin/users', label: t('admin.manageUsers'), icon: 'ri-user-settings-line' },
      { href: '/admin/settings', label: t('admin.siteSettings'), icon: 'ri-settings-3-line' },
      { href: '/admin/content', label: t('admin.cms'), icon: 'ri-layout-text-window-line' },
      { href: '/admin/sliders', label: t('admin.manageSliders'), icon: 'ri-slideshow-line' },
      { href: '/admin/blogs', label: t('admin.manageBlogs'), icon: 'ri-article-line' },
      { href: '/admin/ads', label: t('admin.manageBannerAds'), icon: 'ri-billboard-line' },
      { href: '/admin/profile', label: t('admin.manageProfile'), icon: 'ri-user-line' },
    ],
  };

  const links = linksMapping?.[role as Role];

  const getBackgroundColor = () => {
    switch (type) {
      case 'BUYER': return 'bg-white border-r border-gray-200';
      case 'SELLER': return 'bg-slate-800 text-white';
      case 'DEALER': return 'bg-slate-900 text-white';
      case 'GARAGE': return 'bg-emerald-900 text-white';
      case 'MODERATOR':
      case 'SENIOR_MODERATOR':
      case 'ADMIN':
      case 'SUPER_ADMIN': return 'bg-orange-800 text-white';
      default: return 'bg-slate-900 text-white';
    }
  };

  const getLinkStyles = (isActive: boolean) => {
    const base = 'flex items-center px-4 py-3 rounded-lg transition-colors duration-200';
    if (isActive) {
      switch (type) {
        case 'BUYER': return cn(base, 'bg-blue-100 text-blue-700 font-medium');
        case 'SELLER': return cn(base, 'bg-slate-700 text-white font-medium');
        case 'DEALER': return cn(base, 'bg-slate-800 text-white font-medium');
        case 'GARAGE': return cn(base, 'bg-emerald-800 text-white font-medium');
        case 'MODERATOR':
        case 'SENIOR_MODERATOR':
        case 'ADMIN':
        case 'SUPER_ADMIN': return cn(base, 'bg-orange-700 text-white font-medium');
        default: return cn(base, 'bg-slate-800 text-white font-medium');
      }
    }
    switch (type) {
      case 'BUYER': return cn(base, 'text-gray-700 hover:bg-gray-100');
      case 'SELLER': return cn(base, 'text-slate-300 hover:bg-slate-700');
      case 'DEALER': return cn(base, 'text-slate-400 hover:bg-slate-800');
      case 'GARAGE': return cn(base, 'text-emerald-200 hover:bg-emerald-800');
      case 'MODERATOR':
      case 'SENIOR_MODERATOR':
      case 'ADMIN':
      case 'SUPER_ADMIN': return cn(base, 'text-orange-200 hover:bg-orange-700');
      default: return cn(base, 'text-slate-400 hover:bg-slate-800');
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
          <h3 className={`font-medium ${type !== 'SELLER' ? 'text-white' : ''}`}>
            {user?.firstName || user?.username || 'User'}
          </h3>
          <p className={`text-sm ${type === 'SELLER' ? 'text-white' : 'text-neutral-50'}`}>
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