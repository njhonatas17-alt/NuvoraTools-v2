import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Clock,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Keyboard,
  Home,
  Sparkles,
  Download,
  X
} from 'lucide-react';
import ToolHubLogo from './ToolHubLogo';
import DynamicIcon from './DynamicIcon';
import { CATEGORIES, getAllTools, getToolBySlug } from '../config/toolsRegistry';
import { ThemeMode, ToolDefinition } from '../types/tool';
import { useTranslation } from '../i18n/i18nContext';
import { Language } from '../i18n/translations';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  favoritesCount: number;
  favoriteIds: string[];
  recentlyUsedIds: string[];
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts?: () => void;
  onCloseMobileDrawer?: () => void;
  isMobileDrawer?: boolean;
}

export default React.memo(function Sidebar({
  activeRoute,
  onNavigate,
  favoritesCount,
  favoriteIds,
  recentlyUsedIds,
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenShortcuts,
  onCloseMobileDrawer,
  isMobileDrawer = false,
}: SidebarProps) {
  const { t, language, setLanguage, languages } = useTranslation();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // All registered tools
  const allTools = useMemo(() => getAllTools(), []);

  // Recently used tools definitions
  const recentTools = useMemo(() => {
    return recentlyUsedIds
      .map((id) => allTools.find((t) => t.id === id))
      .filter((t): t is ToolDefinition => Boolean(t))
      .slice(0, 4);
  }, [recentlyUsedIds, allTools]);

  // Identify current active tool category to auto-expand
  const activeToolSlug = activeRoute.startsWith('tool/') ? activeRoute.replace('tool/', '') : '';
  const activeTool = useMemo(() => (activeToolSlug ? getToolBySlug(activeToolSlug) : undefined), [activeToolSlug]);

  // Accordion expanded categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    // Auto expand active tool's category or first category
    if (activeTool) {
      initial[activeTool.category] = true;
    } else {
      initial['generator'] = true;
    }
    return initial;
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 select-none">
      {/* Sidebar Top Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
        <div
          onClick={() => handleLinkClick('')}
          className="flex items-center gap-2 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="NuvoraTools Home"
        >
          <ToolHubLogo size="md" />
        </div>

        {isMobileDrawer && onCloseMobileDrawer && (
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Search Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => {
            onOpenSearch();
            if (onCloseMobileDrawer) onCloseMobileDrawer();
          }}
          className="w-full px-3 py-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 rounded-xl flex items-center justify-between transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Search className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {t('nav.searchShort', 'Search tools...')}
            </span>
          </div>
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs custom-scrollbar">
        {/* Core Nav Section */}
        <div className="space-y-1">
          <button
            onClick={() => handleLinkClick('')}
            className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 font-semibold transition-all ${
              activeRoute === ''
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold border-l-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{t('nav.home', 'Home Dashboard')}</span>
          </button>

          <button
            onClick={() => handleLinkClick('favorites')}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between font-semibold transition-all ${
              activeRoute === 'favorites'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold border-l-2 border-amber-500'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className={`w-4 h-4 ${favoritesCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <span>{t('nav.favorites', 'Favorites')}</span>
            </div>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

        {/* Recently Used Section */}
        {recentTools.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-indigo-500" />
              {t('nav.recent', 'Recently Used')}
            </span>
            {recentTools.map((tool) => (
              <button
                key={`recent_${tool.id}`}
                onClick={() => handleLinkClick(`tool/${tool.slug}`)}
                className={`w-full px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors truncate ${
                  activeRoute === `tool/${tool.slug}` ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                }`}
              >
                <DynamicIcon name={tool.icon} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{tool.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Categories Accordion Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('nav.categories', 'Categories & Tools')}
          </span>

          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const categoryTools = allTools.filter((t) => t.category === cat.id);
              const isExpanded = Boolean(expandedCategories[cat.id]);

              return (
                <div key={cat.id} className="space-y-0.5">
                  {/* Category Header Button */}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-bold group text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={cat.iconName} className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{t(`cat.${cat.id}.name`, cat.name)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {categoryTools.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Tools List */}
                  {isExpanded && (
                    <div className="pl-6 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 ml-4 my-1">
                      {categoryTools.map((tool) => {
                        const isActive = activeRoute === `tool/${tool.slug}`;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleLinkClick(`tool/${tool.slug}`)}
                            className={`w-full px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] transition-colors group ${
                              isActive
                                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <DynamicIcon
                                name={tool.icon}
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'
                                }`}
                              />
                              <span className="truncate">{tool.title}</span>
                            </div>

                            {tool.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                  tool.badge === 'New'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                                }`}
                              >
                                {tool.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Bottom Controls */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
        {/* PWA App Install Button */}
        {isInstallable && (
          <button
            onClick={triggerInstall}
            className="w-full px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/60 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('nav.installApp', 'Install NuvoraTools App')}</span>
          </button>
        )}

        <div className="flex items-center justify-between text-xs">
          {/* Language Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 font-bold text-[11px]"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span className="uppercase">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as Language);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      language === l.code
                        ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span>{l.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>
        </div>
      </div>
    </div>
  );
});
