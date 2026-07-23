import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import CategoryGrid from './components/CategoryGrid';
import ToolCard from './components/ToolCard';
import HomeGoalsSection from './components/HomeGoalsSection';
import ToolLayout from './components/ToolLayout';

import SearchModal from './components/SearchModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import OfflineBanner from './components/OfflineBanner';
import StaticPages from './components/StaticPages';
import { HeaderAdBanner } from './components/ads/HeaderAdBanner';
import {
  getAllTools,
  getToolBySlug,
  getFeaturedTools,
  getRankedPopularTools,
  searchTools,
} from './config/toolsRegistry';
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
import { Star, Sparkles, Flame, Layers } from 'lucide-react';

export default function App() {
  const { t, language } = useTranslation();

  // Routing state based on window.location.pathname or hash fallback
  const [route, setRoute] = useState<string>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return path || '';
  });

  // Search Modal, Shortcuts Modal & Mobile Drawer state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // Category filter state on homepage / category page
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
  const navigate = useCallback((newRoute: string) => {
    setRoute(newRoute);
    window.history.pushState({}, '', newRoute ? `/${newRoute}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageView(newRoute || 'home');
  }, []);

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

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavoriteTool(id);
    setFavoriteIds(updated);
  }, []);

  // Check if current route is a tool page: "tool/slug"
  const currentTool = useMemo(() => {
    if (route.startsWith('tool/')) {
      const slug = route.replace('tool/', '');
      const tool = getToolBySlug(slug);
      if (tool) {
        trackRecentlyUsedTool(tool.id);
      }
      return tool;
    }
    return undefined;
  }, [route]);

  // Update recently used list when tool changes
  useEffect(() => {
    if (currentTool) {
      setRecentlyUsedIds(getRecentlyUsedToolIds());
    }
  }, [currentTool]);

  // Check if route is category page: "category/id"
  const categoryFilterFromRoute = useMemo(() => {
    if (route.startsWith('category/')) {
      return route.replace('category/', '');
    }
    return null;
  }, [route]);

  const allTools = useMemo(() => getAllTools(), []);
  const popularTools = useMemo(
    () => getRankedPopularTools(allTools, favoriteIds, 6),
    [allTools, favoriteIds]
  );

  // Compute new tools (e.g., tools with badge === 'New' or 'AI')
  const newTools = useMemo(() => {
    return allTools.filter((t) => t.badge === 'New' || t.badge === 'AI').slice(0, 6);
  }, [allTools]);

  // Compute tool counts per category
  const toolCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    allTools.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [allTools]);

  // Filter tools for category page or custom category selection
  const categoryDisplayedTools = useMemo(() => {
    const effectiveCategory = categoryFilterFromRoute || activeCategory;
    if (!effectiveCategory) return [];
    return allTools.filter((tool) => tool.category === effectiveCategory);
  }, [allTools, categoryFilterFromRoute, activeCategory]);

  // Favorite tools list
  const favoriteTools = useMemo(() => {
    return allTools.filter((t) => favoriteIds.includes(t.id));
  }, [allTools, favoriteIds]);

  // Update SEO metatags for non-tool pages
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
        const homeTitles: Record<string, string> = {
          pt: 'NuvoraTools — Ferramentas Online Gratuitas para Desenvolvedores',
          es: 'NuvoraTools — Herramientas Online Gratuitas para Desarrolladores',
          fr: 'NuvoraTools — Outils en Ligne Gratuits pour Développeurs',
          de: 'NuvoraTools — Kostenlose Online-Entwickler-Tools & Dienstprogramme',
          en: 'NuvoraTools — Free Online Utility Tools & Developer Suite',
        };
        const homeDescs: Record<string, string> = {
          pt: 'Ferramentas utilitárias online 100% gratuitas e privadas no navegador. Gere faturas com IA, códigos QR, senhas, UUIDs, converta unidades, conte palavras e teste digitação.',
          es: 'Herramientas online 100% gratuitas y privadas en tu navegador. Genera facturas con IA, códigos QR, contraseñas, UUIDs, convierte unidades y cuenta palabras.',
          fr: 'Outils utilitaires en ligne 100% gratuits et privés dans le navigateur. Générez des factures IA, QR codes, mots de passe, UUID, convertissez des unités.',
          de: '100% kostenlose und private Online-Tools im Browser. Erstellen Sie KI-Rechnungen, QR-Codes, Passwörter, UUIDs, Einheiten umrechnen und Wörter zählen.',
          en: '100% free, fast, browser-based developer utility tools. Generate invoices, QR codes, passwords, UUIDs, convert units, count words, pick colors, and test typing speed with client-side privacy.',
        };
        updateSEO({
          title: homeTitles[language] || homeTitles.en,
          description: homeDescs[language] || homeDescs.en,
          path: '',
        });
      }
    }
  }, [currentTool, route, categoryFilterFromRoute, language]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      {/* Offline Status Banner */}
      <OfflineBanner />

      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:block w-[270px] shrink-0 h-screen sticky top-0 z-30 border-r border-slate-200/80 dark:border-slate-800/80">
        <Sidebar
          activeRoute={route}
          onNavigate={navigate}
          favoritesCount={favoriteIds.length}
          favoriteIds={favoriteIds}
          recentlyUsedIds={recentlyUsedIds}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      </aside>

      {/* Mobile Sidebar Slide-Over Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-950 shadow-2xl z-10 flex flex-col">
            <Sidebar
              activeRoute={route}
              onNavigate={navigate}
              favoritesCount={favoriteIds.length}
              favoriteIds={favoriteIds}
              recentlyUsedIds={recentlyUsedIds}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Main Right Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen w-full">
        {/* Mobile Top Header (only visible on mobile/tablet) */}
        <MobileHeader
          theme={theme}
          onToggleTheme={handleToggleTheme}
          favoritesCount={favoriteIds.length}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onNavigate={navigate}
        />

        <main className="flex-1 min-w-0 w-full">
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
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t('fav.title', 'Your Favorite Tools')} ({favoriteTools.length})
                  </h1>
                  <p className="text-xs text-slate-500">
                    {t('fav.sub', 'Quick access to your saved browser utilities.')}
                  </p>
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
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('grid.noFavorites', 'No favorite tools saved yet')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('grid.noFavoritesSub', 'Click the star icon on any tool card or sidebar to add it to your quick favorites!')}
                  </p>
                  <button
                    onClick={() => navigate('')}
                    className="mt-2 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    {t('grid.exploreAll', 'Explore All Tools')}
                  </button>
                </div>
              )}
            </div>
          ) : categoryFilterFromRoute || activeCategory ? (
            /* Category Filtered View */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                    {t(`cat.${categoryFilterFromRoute || activeCategory}.name`, categoryFilterFromRoute || activeCategory)}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('grid.categorySub', 'Explore browser utilities in this category')} ({categoryDisplayedTools.length})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    navigate('');
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {t('grid.resetFilter', 'Reset Filter')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryDisplayedTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favoriteIds.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            </div>
          ) : ['about', 'contact', 'privacy', 'terms'].includes(route) ? (
            /* Static Pages */
            <StaticPages page={route as any} onNavigate={navigate} />
          ) : (
            /* Streamlined Homepage View */
            <div className="space-y-12 pb-12">
              {/* Header Ad Banner */}
              <HeaderAdBanner />

              {/* 1. Hero Section */}
              <HeroSection
                onSearchQuery={setHeroSearchQuery}
                searchResults={searchTools(heroSearchQuery)}
                onNavigate={navigate}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* 2. Popular Tools Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {t('home.popularTitle', 'Popular Tools')}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {popularTools.map((tool) => (
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

                {/* 3. New Tools Section */}
                {newTools.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {t('home.newTitle', 'New Tools')}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {newTools.map((tool) => (
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

                {/* 4. Tools by Objective Section */}
                <HomeGoalsSection
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onNavigate={navigate}
                />

                {/* 5. Category Grid */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {t('home.categoriesTitle', 'Explore by Category')}
                    </h2>
                  </div>

                  <CategoryGrid
                    activeCategory={null}
                    onSelectCategory={(cat) => {
                      setActiveCategory(cat);
                      navigate(`category/${cat}`);
                    }}
                    toolCountByCategory={toolCountByCategory}
                  />
                </section>


                {/* 5. NuvoraTools Ecosystem SEO Section */}
                <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                  <div className="text-center max-w-3xl mx-auto space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {t('home.ecoTitle', 'Why Developers & Teams Choose NuvoraTools')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('home.ecoSubtitle', 'Free, fast, and privacy-first online utilities executing 100% inside your web browser.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400">
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        100%
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('home.p1Title', '100% Client-Side Browser Execution')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('home.p1Desc', 'All calculations, text analysis, QR code generation, typing tests, and PDF invoice rendering execute locally inside your web browser sandbox memory. Your data never leaves your device.')}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                        $0
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('home.p2Title', 'Zero Paywalls & Unlimited Usage')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('home.p2Desc', 'NuvoraTools is built to deliver clean, privacy-respecting, enterprise-grade utilities without monthly subscription fees, registration walls, or daily limits.')}
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                        ⚡
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('home.p3Title', 'Designed for Developers & Modern Workflows')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('home.p3Desc', 'Easily generate UUID v4/v7 identifiers, secure random passwords, test typing speed in WPM, convert units, generate WhatsApp wa.me direct links, and pick colors in seconds.')}
                      </p>
                    </div>
                  </div>
                </section>

                {/* 6. General FAQ Section */}
                <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {t('faq.title', 'Frequently Asked Questions')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('faq.subtitle', "Everything you need to know about NuvoraTools's free browser utilities and data privacy.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400">
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('faq.q1', 'Are all tools completely free?')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('faq.a1', 'Yes. All utility tools, generators, and converters on NuvoraTools are 100% free with no hidden paywalls or registration required.')}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('faq.q2', 'Where is my data processed?')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('faq.a2', 'All calculations, text analysis, QR code generation, and PDF document rendering execute locally in your web browser.')}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('faq.q3', 'How easy is it to scale to 500+ tools?')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('faq.a3', 'NuvoraTools uses an automatic registry system where every tool added to toolsRegistry automatically populates the sidebar and search indexing.')}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t('faq.q4', 'Can I use generated PDF invoices for business?')}
                      </h3>
                      <p className="leading-relaxed">
                        {t('faq.a4', 'Yes! Downloaded PDF invoices are vector-rendered, professional, and ready to send directly to your clients.')}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer onNavigate={navigate} />
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
    </div>
  );
}
