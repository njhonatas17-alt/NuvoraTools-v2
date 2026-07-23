import React, { useState } from 'react';
import { Search, Star, Sun, Moon, Menu, X, Globe, Keyboard, Download } from 'lucide-react';
import ToolHubLogo from './ToolHubLogo';
import { ThemeMode } from '../types/tool';
import { useTranslation } from '../i18n/i18nContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Language } from '../i18n/translations';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenSearch: () => void;
  onNavigate: (route: string) => void;
  activeRoute: string;
  onOpenShortcuts?: () => void;
}

export default function Navbar({
  theme,
  onToggleTheme,
  favoritesCount,
  onOpenSearch,
  onNavigate,
  activeRoute,
  onOpenShortcuts,
}: NavbarProps) {
  const { t, language, setLanguage, languages } = useTranslation();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { label: t('nav.tools', 'All Tools'), route: '' },
    { label: t('cat.generator.name', 'Generators'), route: 'category/generator' },
    { label: t('cat.calculator.name', 'Calculators'), route: 'category/calculator' },
    { label: t('cat.converter.name', 'Converters'), route: 'category/converter' },
    { label: t('cat.developer.name', 'Developer'), route: 'category/developer' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onNavigate('')}
          className="flex items-center gap-2 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="NuvoraTools Home"
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('')}
        >
          <ToolHubLogo size="md" />
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">
            {t('nav.freeTag', '100% Free')}
          </span>
        </div>

        {/* Search Bar Button Trigger (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <button
            onClick={onOpenSearch}
            className="w-full px-4 py-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between transition-all shadow-xs"
            aria-label={t('nav.search', 'Search tools')}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>{t('nav.search', 'Search 10+ developer & utility tools...')}</span>
            </div>
            <kbd className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <nav className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mr-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => onNavigate(link.route)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeRoute === link.route
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={triggerInstall}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
              title="Install NuvoraTools App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>App</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Change Language"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="uppercase">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as Language);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      language === l.code ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span>{l.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {/* Favorites Button */}
          <button
            onClick={() => onNavigate('favorites')}
            className={`relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors ${
              activeRoute === 'favorites' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-500' : ''
            }`}
            title="Favorite tools"
            aria-label="View Favorites"
          >
            <Star className={`w-4 h-4 ${favoritesCount > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  onNavigate(link.route);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left border ${
                  activeRoute === link.route
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('favorites');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-left border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between"
            >
              <span>{t('nav.favorites', 'Favorites')}</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white font-bold rounded-full">
                {favoritesCount}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t('nav.selectLanguage', 'Select Language:')}</span>
            <div className="flex gap-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className={`px-2 py-1 rounded border text-[10px] font-bold ${
                    language === l.code
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

