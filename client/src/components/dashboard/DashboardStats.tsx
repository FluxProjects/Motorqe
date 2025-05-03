import i18n, { resources } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  type: 'buyer' | 'seller' | 'showroom' | 'admin';
}

const StatCard = ({ title, value, icon, type }: StatCardProps) => {
  const getBgColor = () => {
    switch (type) {
      case 'buyer':
        return 'bg-neutral-50';
      case 'seller':
        return 'bg-neutral-50';
      case 'showroom':
        return 'bg-teal-50';
      case 'admin':
        return 'bg-slate-800';
      default:
        return 'bg-neutral-50';
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'buyer':
        return 'bg-primary-light text-primary';
      case 'seller':
        return 'bg-primary-light text-primary';
      case 'showroom':
        return 'bg-teal-500 text-white';
      case 'admin':
        return 'bg-slate-700 text-blue-400';
      default:
        return 'bg-primary-light text-primary';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'buyer':
        return 'border-neutral-200';
      case 'seller':
        return 'border-neutral-200';
      case 'showroom':
        return 'border-teal-500';
      case 'admin':
        return 'border-slate-700';
      default:
        return 'border-neutral-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'buyer':
        return 'text-neutral-600';
      case 'seller':
        return 'text-neutral-600';
      case 'showroom':
        return 'text-teal-700';
      case 'admin':
        return 'text-slate-400';
      default:
        return 'text-neutral-600';
    }
  };

  const getValueColor = () => {
    switch (type) {
      case 'buyer':
        return 'text-neutral-900';
      case 'seller':
        return 'text-neutral-900';
      case 'showroom':
        return 'text-teal-900';
      case 'admin':
        return 'text-white';
      default:
        return 'text-neutral-900';
    }
  };

  return (
    <div className={cn('p-4 rounded-lg border', getBgColor(), getBorderColor())}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-sm', getTextColor())}>{title}</p>
          <h3 className={cn('text-2xl font-bold', getValueColor())}>{value}</h3>
        </div>
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', getIconBgColor())}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  type: 'buyer' | 'seller' | 'admin' | 'showroom';
  stats: Array<{
    title: string;
    value: string | number;
    icon: string;
  }>;
}

const DashboardStats = ({ type, stats }: DashboardStatsProps) => {
  const { t } = useTranslation();
  const language = i18n.language;
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={`grid grid-cols-1 ${type === 'admin' ? 'md:grid-cols-4' : type === 'showroom' ? 'md:grid-cols-3' : 'md:grid-cols-3'} gap-6 mb-8`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          type={type}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
