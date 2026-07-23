import React from 'react';
import { Menu, Search, Star, Sun, Moon } from 'lucide-react';
import ToolHubLogo from './ToolHubLogo';
import { ThemeMode } from '../types/tool';

interface MobileHeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenSearch: () => void;
  onOpenMobileDrawer: () => void;
  onNavigate: (route: string) => void;
}

export default React.memo(function MobileHeader({
  theme,
  onToggleTheme,
  favoritesCount,
  onOpenSearch,
  onOpenMobileDrawer,
  onNavigate,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Left: Mobile Menu Drawer Trigger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileDrawer}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('')}
            className="flex items-center gap-2 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="NuvoraTools Home"
          >
            <ToolHubLogo size="sm" />
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Search Tools"
          >
            <Search className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Favorites */}
          <button
            onClick={() => onNavigate('favorites')}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="View Favorites"
          >
            <Star className={`w-4 h-4 ${favoritesCount > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
});
