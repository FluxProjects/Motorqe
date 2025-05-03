// components/data/FilterBar.tsx
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, X, Calendar as CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'toggle' | 'daterange';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  queryKey: string[];
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
}

export function FilterBar({ queryKey, filters, onFilterChange }: FilterBarProps) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<{key: string; label: string; value: any}[]>([]);
  const debouncedFilters = useDebounce(localFilters, 500);

  // Update active filters whenever localFilters change
  useEffect(() => {
    const newActiveFilters = Object.entries(localFilters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        const filterConfig = filters.find(f => f.key === key);
        return {
          key,
          label: filterConfig?.label || key,
          value: formatFilterValue(value, filterConfig?.type)
        };
      });
    setActiveFilters(newActiveFilters);
  }, [localFilters, filters]);

  // Handle date range separately
  useEffect(() => {
    if (dateRange && (dateRange.from || dateRange.to)) {
      setLocalFilters(prev => ({
        ...prev,
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString()
      }));
    }
  }, [dateRange]);
  

  useQuery({
    queryKey: [...queryKey, debouncedFilters],
    queryFn: () => {
      onFilterChange(debouncedFilters);
      return Promise.resolve();
    },
    enabled: Object.keys(debouncedFilters).length > 0
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setLocalFilters({});
    setDateRange({ from: undefined, to: undefined });
    onFilterChange({});
  };

  const removeFilter = (key: string) => {
    setLocalFilters(prev => {
      const newFilters = {...prev};
      delete newFilters[key];
      return newFilters;
    });
    
    // Special handling for date range
    if (key === 'dateFrom' || key === 'dateTo') {
      if (key === 'dateFrom' || key === 'dateTo') {
        setDateRange({ from: undefined, to: undefined });
      }
    }
    
  };

  const formatFilterValue = (value: any, type?: string): string => {
    if (type === 'daterange') {
      const from = localFilters.dateFrom ? new Date(localFilters.dateFrom) : undefined;
      const to = localFilters.dateTo ? new Date(localFilters.dateTo) : undefined;
      if (from && to) {
        return `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`;
      }
      return from ? `After ${format(from, 'MMM d, yyyy')}` : 
             to ? `Before ${format(to, 'MMM d, yyyy')}` : '';
    }
    if (type === 'date') {
      return format(new Date(value), 'MMM d, yyyy');
    }
    if (type === 'toggle') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Active filters chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <Badge 
              key={filter.key}
              variant="outline"
              className="px-3 py-1 text-sm flex items-center gap-2"
            >
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.value}</span>
              <button 
                onClick={() => removeFilter(filter.key)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-destructive h-8"
          >
            {t('common.clearAll')}
          </Button>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        {filters.map(filter => {
          switch (filter.type) {
            case 'text':
              return (
                <div key={filter.key} className="min-w-[200px]">
                  <Input
                    placeholder={filter.placeholder || filter.label}
                    value={localFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                </div>
              );

            case 'select':
              return (
                <div key={filter.key} className="min-w-[200px]">
                  <Select
                    value={localFilters[filter.key] || ''}
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder || filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );

            case 'toggle':
              return (
                <div key={filter.key} className="flex items-center gap-3 min-w-[200px]">
                  <Switch
                    id={filter.key}
                    checked={!!localFilters[filter.key]}
                    onCheckedChange={(checked) => handleFilterChange(filter.key, checked)}
                  />
                  <label htmlFor={filter.key} className="text-sm">
                    {filter.label}
                  </label>
                </div>
              );

            case 'date':
              return (
                <div key={filter.key} className="min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !localFilters[filter.key] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters[filter.key] ? 
                          format(new Date(localFilters[filter.key]), 'PPP') : 
                          (filter.placeholder || filter.label)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters[filter.key] ? new Date(localFilters[filter.key]) : undefined}
                        onSelect={(date) => handleFilterChange(filter.key, date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              );

            case 'daterange':
              return (
                <div key={filter.key} className="min-w-[250px]">
                  <Popover>
                    <PopoverTrigger asChild>
                    <Button
  variant="outline"
  className={cn(
    "w-full justify-start text-left font-normal",
    !(dateRange?.from || dateRange?.to) && "text-muted-foreground"
  )}
>
  <CalendarIcon className="mr-2 h-4 w-4" />
  {dateRange?.from ? (
    dateRange?.to ? (
      <>
        {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd, y')}
      </>
    ) : (
      format(dateRange.from, 'LLL dd, y')
    )
  ) : (
    <span>{filter.placeholder || filter.label}</span>
  )}
</Button>

                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from ?? new Date()}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />

                    </PopoverContent>
                  </Popover>
                </div>
              );

            default:
              return null;
          }
        })}

        <Button
          variant="outline"
          onClick={() => onFilterChange(localFilters)}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          {t('common.apply')}
        </Button>
      </div>
    </div>
  );
}