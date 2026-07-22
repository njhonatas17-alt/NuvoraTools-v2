import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import CategoryGrid from './components/CategoryGrid';
import ToolCard from './components/ToolCard';
import ToolLayout from './components/ToolLayout';
import SearchModal from './components/SearchModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import OfflineBanner from './components/OfflineBanner';
import StaticPages from './components/StaticPages';
import { HeaderAdBanner } from './components/ads/HeaderAdBanner';
import {
  getAllTools,
  getToolBySlug,
  getToolsByCategory,
  getFeaturedTools,
  searchTools,
} from './config/toolsRegistry';
import { TOOL_COLLECTIONS } from './config/collections';
import { ThemeMode, ToolDefinition } from './types/tool';
import {
  getFavoriteToolIds,
  toggleFavoriteTool,
  getRecentlyUsedToolIds,
  trackRecentlyUsedTool,
} from './lib/utils';
import { updateSEO } from './lib/seo';
import { trackPageView } from './lib/analytics';
import { useTranslation } from './i18n/i18nContext';
import { Star, Sparkles, Filter, Wrench, Layers } from 'lucide-react';

export default function App() {
  const { t } = useTranslation();

  // Routing state based on window.location.pathname or hash fallback
  const [route, setRoute] = useState<string>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return path || '';
  });

  // Search Modal state & Keyboard Shortcuts Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // Category filter state on homepage
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Theme mode state (light / dark)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nuvoratools_theme') || localStorage.getItem('toolhub_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Favorites & Recently Used state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteToolIds());
  const [recentlyUsedIds, setRecentlyUsedIds] = useState<string[]>(() => getRecentlyUsedToolIds());

  // Apply theme class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nuvoratools_theme', theme);
  }, [theme]);

  // PushState & PopState handling for clean URLs
  const navigate = (newRoute: string) => {
    setRoute(newRoute);
    window.history.pushState({}, '', newRoute ? `/${newRoute}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageView(newRoute || 'home');
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      setRoute(path || '');
      trackPageView(path || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavoriteTool(id);
    setFavoriteIds(updated);
  };

  // Check if current route is a tool page: "tool/slug"
  let currentTool: ToolDefinition | undefined = undefined;
  if (route.startsWith('tool/')) {
    const slug = route.replace('tool/', '');
    currentTool = getToolBySlug(slug);
    if (currentTool) {
      trackRecentlyUsedTool(currentTool.id);
    }
  }

  // Check if route is category page: "category/id"
  let categoryFilterFromRoute: string | null = null;
  if (route.startsWith('category/')) {
    categoryFilterFromRoute = route.replace('category/', '');
  }

  const allTools = getAllTools();
  const featuredTools = getFeaturedTools();

  // Compute tool counts per category
  const toolCountByCategory: Record<string, number> = {};
  allTools.forEach((t) => {
    toolCountByCategory[t.category] = (toolCountByCategory[t.category] || 0) + 1;
  });

  // Filter tools for display on homepage
  const displayedTools = allTools.filter((tool) => {
    const effectiveCategory = categoryFilterFromRoute || activeCategory;
    if (effectiveCategory && tool.category !== effectiveCategory) {
      return false;
    }
    return true;
  });

  // Favorite tools list
  const favoriteTools = allTools.filter((t) => favoriteIds.includes(t.id));

  // Update homepage / category SEO
  useEffect(() => {
    if (!currentTool) {
      if (categoryFilterFromRoute) {
        updateSEO({
          title: `${categoryFilterFromRoute.toUpperCase()} Utilities & Tools — NuvoraTools`,
          description: `Discover free browser-based ${categoryFilterFromRoute} utilities with 100% client-side privacy.`,
          path: route,
        });
      } else if (route === 'favorites') {
        updateSEO({
          title: 'Saved Favorite Tools — NuvoraTools',
          description: 'Your saved favorite utility tools for quick browser access.',
          path: route,
        });
      } else if (['about', 'contact', 'privacy', 'terms'].includes(route)) {
        updateSEO({
          title: `${route.toUpperCase()} — NuvoraTools Utilities`,
          description: `Learn more about NuvoraTools ${route} policies and browser sandbox security.`,
          path: route,
        });
      } else {
        updateSEO({
          title: 'NuvoraTools — Free Online Utility Tools & Developer Suite',
          description: '100% free, fast, browser-based developer utility tools. Generate invoices, QR codes, passwords, UUIDs, convert units, count words, pick colors, and more with client-side privacy.',
          path: '',
        });
      }
    }
  }, [currentTool, route, categoryFilterFromRoute]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Offline Status Banner */}
      <OfflineBanner />

      {/* Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        favoritesCount={favoriteIds.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onNavigate={navigate}
        activeRoute={route}
      />

      {/* Main Body */}
      <div className="flex-1">
        {currentTool ? (
          /* Single Tool View */
          <ToolLayout
            tool={currentTool}
            isFavorite={favoriteIds.includes(currentTool.id)}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={navigate}
            recentlyUsedIds={recentlyUsedIds}
          />
        ) : route === 'favorites' ? (
          /* Favorites Page */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Favorite Tools ({favoriteTools.length})</h1>
                <p className="text-xs text-slate-500">Quick access to your saved browser utilities.</p>
              </div>
            </div>

            {favoriteTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <Star className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No favorite tools saved yet</h3>
                <p className="text-xs text-slate-500">
                  Click the star icon on any tool card to add it to your quick favorites!
                </p>
                <button
                  onClick={() => navigate('')}
                  className="mt-2 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl shadow-xs"
                >
                  Explore All Tools
                </button>
              </div>
            )}
          </div>
        ) : ['about', 'contact', 'privacy', 'terms'].includes(route) ? (
          /* Static Pages */
          <StaticPages page={route as any} onNavigate={navigate} />
        ) : (
          /* Main Homepage View */
          <div className="space-y-12">
            {/* Header Ad Banner */}
            <HeaderAdBanner />

            {/* Hero Banner */}
            <HeroSection
              onSearchQuery={setHeroSearchQuery}
              searchResults={searchTools(heroSearchQuery)}
              onNavigate={navigate}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              {/* Category Grid */}
              <CategoryGrid
                activeCategory={categoryFilterFromRoute || activeCategory}
                onSelectCategory={(cat) => {
                  setActiveCategory(cat);
                  if (categoryFilterFromRoute) {
                    navigate('');
                  }
                }}
                toolCountByCategory={toolCountByCategory}
              />

              {/* Collections Grid */}
              {!(categoryFilterFromRoute || activeCategory) && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Curated Tool Collections</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {TOOL_COLLECTIONS.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => navigate(`category/${col.toolIds[0] ? getToolBySlug(col.toolIds[0])?.category || '' : ''}`)}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 transition-all cursor-pointer group shadow-xs space-y-2"
                      >
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between">
                          <span>{col.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {col.toolIds.length} tools
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{col.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Featured Tools Row */}
              {!(categoryFilterFromRoute || activeCategory) && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Featured Utility Tools</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {featuredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        isFavorite={favoriteIds.includes(tool.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onNavigate={navigate}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Tools Grid */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {categoryFilterFromRoute || activeCategory
                      ? `Category: ${categoryFilterFromRoute || activeCategory}`
                      : 'All Utilities & Developer Tools'}
                    <span className="ml-2 text-xs font-semibold text-slate-400">
                      ({displayedTools.length})
                    </span>
                  </h2>

                  {(categoryFilterFromRoute || activeCategory) && (
                    <button
                      onClick={() => {
                        setActiveCategory(null);
                        navigate('');
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={favoriteIds.includes(tool.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onNavigate={navigate}
                    />
                  ))}
                </div>
              </section>

              {/* General FAQ Section */}
              <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('faq.subtitle', "Everything you need to know about NuvoraTools's free browser utilities and data privacy.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400">
                  <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Are all tools completely free?
                    </h3>
                    <p className="leading-relaxed">
                      {t('faq.a1', 'Yes. All 10+ utility tools, generators, and converters on NuvoraTools are 100% free with no hidden paywalls or registration required.')}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Where is my data processed?
                    </h3>
                    <p className="leading-relaxed">
                      All calculations, text analysis, QR code generation, and PDF document rendering execute locally in your web browser.
                    </p>
                  </div>

                  <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      How easy is it to scale to 500+ tools?
                    </h3>
                    <p className="leading-relaxed">
                      {t('faq.a3', 'NuvoraTools uses a modular registry system where adding a new tool requires creating a single component and registering it in toolsRegistry.ts.')}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Can I use generated PDF invoices for business?
                    </h3>
                    <p className="leading-relaxed">
                      Yes! Downloaded PDF invoices are vector-rendered, professional, and ready to send directly to your clients.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
