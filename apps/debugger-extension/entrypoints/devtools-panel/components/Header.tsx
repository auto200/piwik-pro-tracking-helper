import type { Ref } from 'react';
import { ArrowRight, ArrowUpDown, Ban, Moon, RefreshCcw, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Filters } from '../App';
import { useTheme } from '../contexts/ThemeContext';

type HeaderProps = {
  ref: Ref<HTMLDivElement>;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  reset: () => void;
  onHardReload: () => void;
};

export function Header({ ref, filters, onFiltersChange, reset, onHardReload }: HeaderProps) {
  const { setTheme, theme } = useTheme();
  const handleFilterChange = (filter: Filters[number] | undefined) => {
    if (!filter) {
      onFiltersChange([]);
      return;
    }

    if (filters.includes(filter)) {
      onFiltersChange(filters.filter((f) => f !== filter));
      return;
    }

    onFiltersChange([...filters, filter]);
  };

  const badgeColor = theme === 'light' ? 'bg-blue-200' : 'bg-slate-700';
  const badgeHoverColor = theme === 'light' ? 'hover:bg-slate-300' : 'hover:bg-slate-600';

  return (
    <div ref={ref} className="flex items-center overflow-hidden p-[2px]">
      <Button
        title="Clear event log"
        variant="outline"
        size="sm"
        onClick={reset}
        className="mr-1 h-7"
      >
        <Ban />
      </Button>

      <Button
        title="Clear and reload page"
        variant="outline"
        size="sm"
        onClick={onHardReload}
        className="h-7"
      >
        <RefreshCcw />
      </Button>

      {/* filters */}
      <div className="ml-5 flex select-none items-center gap-1">
        <Badge
          variant="outline"
          className={cn(filters.length === 0 ? badgeColor : badgeHoverColor, 'cursor-pointer')}
          onClick={() => handleFilterChange(undefined)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
          </svg>
          All
        </Badge>
        <div className="h-4 w-[1px] bg-slate-600">⠀</div>
        <Badge
          variant="outline"
          className={cn(
            filters.includes('PAQ_ENTRY') ? badgeColor : badgeHoverColor,
            'cursor-pointer'
          )}
          onClick={() => handleFilterChange('PAQ_ENTRY')}
        >
          <ArrowRight size={12} className="text-green-500" />
          _paq
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            filters.includes('PAQ_NETWORK_EVENT') ? badgeColor : badgeHoverColor,
            'cursor-pointer'
          )}
          onClick={() => handleFilterChange('PAQ_NETWORK_EVENT')}
        >
          <ArrowUpDown size={12} className="text-green-700" /> _paq
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            filters.includes('PPAS_ENTRY') ? badgeColor : badgeHoverColor,
            'cursor-pointer'
          )}
          onClick={() => handleFilterChange('PPAS_ENTRY')}
        >
          <ArrowRight size={12} className="text-purple-400" />
          _ppas
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            filters.includes('PPAS_NETWORK_EVENT') ? badgeColor : badgeHoverColor,
            'cursor-pointer'
          )}
          onClick={() => handleFilterChange('PPAS_NETWORK_EVENT')}
        >
          <ArrowUpDown size={12} className="text-purple-500" /> _ppas
        </Badge>
      </div>
      {/* theme toggle */}
      <Button
        variant="outline"
        size="icon"
        className="ml-auto mr-1 h-5 w-5"
        onClick={() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
        }}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
