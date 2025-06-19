import i18n from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  type: 'garage' | 'seller' | 'dealer' | 'admin';
}

const StatCard = ({ title, value, icon, type }: StatCardProps) => {
  const getColorConfig = () => {
    switch (type) {
      case 'garage':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          value: 'text-emerald-900',
          iconBg: 'bg-emerald-100 text-emerald-800',
        };
      case 'seller':
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          value: 'text-slate-900',
          iconBg: 'bg-slate-200 text-slate-800',
        };
      case 'dealer':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-700',
          value: 'text-teal-900',
          iconBg: 'bg-teal-500 text-white',
        };
      case 'admin':
        return {
          bg: 'bg-orange-800',
          border: 'border-orange-700',
          text: 'text-orange-200',
          value: 'text-white',
          iconBg: 'bg-orange-700 text-orange-200',
        };
      default:
        return {
          bg: 'bg-neutral-50',
          border: 'border-neutral-200',
          text: 'text-neutral-600',
          value: 'text-neutral-900',
          iconBg: 'bg-neutral-100 text-neutral-600',
        };
    }
  };

  const { bg, border, text, value: valueColor, iconBg } = getColorConfig();

  return (
    <div className={cn('p-4 rounded-lg border shadow-sm', bg, border)}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-sm', text)}>{title}</p>
          <h3 className={cn('text-2xl font-bold mt-1', valueColor)}>{value}</h3>
        </div>
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconBg)}>
          <i className={`${icon} text-lg`} />
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  type: 'garage' | 'seller' | 'admin' | 'dealer';
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

  const getGridCols = () => {
    switch (type) {
      case 'admin':
        return 'md:grid-cols-4';
      case 'dealer':
      case 'garage':
      case 'seller':
      default:
        return 'md:grid-cols-3';
    }
  };

  return (
    <div className={cn('grid grid-cols-1 gap-6 mb-8', getGridCols())} dir={direction}>
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
