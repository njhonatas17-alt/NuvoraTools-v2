import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, ShieldCheck, Zap, ArrowRight, Wrench, Command } from 'lucide-react';
import { ToolDefinition } from '../types/tool';
import DynamicIcon from './DynamicIcon';
import { useTranslation } from '../i18n/i18nContext';

interface HeroSectionProps {
  onSearchQuery: (q: string) => void;
  searchResults: ToolDefinition[];
  onNavigate: (slug: string) => void;
}

export default function HeroSection({ onSearchQuery, searchResults, onNavigate }: HeroSectionProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (⌘K or / to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearchQuery(val);
  };

  const quickShortcuts = [
    { label: t('hero.shortcutAiInvoice', 'AI Invoice'), slug: 'tool/ai-invoice-generator' },
    { label: t('hero.shortcutQrCode', 'QR Code Generator'), slug: 'tool/qr-code-generator' },
    { label: t('hero.shortcutPassword', 'Password Generator'), slug: 'tool/password-generator' },
    { label: t('hero.shortcutUuid', 'UUID v4/v7'), slug: 'tool/uuid-generator' },
    { label: t('hero.shortcutUnitConverter', 'Unit Converter'), slug: 'tool/unit-converter' },
    { label: t('hero.shortcutColorPicker', 'Color Picker'), slug: 'tool/color-picker-converter' },
    { label: t('hero.shortcutTyping', 'Typing Test'), slug: 'tool/typing-speed-test' },
  ];

  return (
    <section className="relative py-10 md:py-14 text-center max-w-4xl mx-auto px-4">
      {/* Decorative Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Hero Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/90 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-5 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{t('hero.eyebrow', 'Fast, Private & Browser-Based Developer Suite')}</span>
      </div>

      {/* Main Title - Strong Headline */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
        <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          {t('hero.mainTitle', '100+ Free Online Tools for Developers, Creators & Businesses')}
        </span>
      </h1>

      <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
        {t('hero.subtitle', 'All-in-one suite of privacy-first, lightning-fast utilities. No registration, no page reloads, 100% client-side execution.')}
      </p>

      {/* Interactive Hero Search Box */}
      <div className="relative max-w-xl mx-auto mt-7">
        <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={t('hero.searchPlaceholder', 'Search tools (e.g. invoice, qr, uuid, unit, color)...')}
            className="w-full px-4 py-3.5 text-sm bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 font-medium"
          />
          <div className="flex items-center gap-2 mr-3 shrink-0">
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  onSearchQuery('');
                }}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800"
              >
                {t('action.clear', 'Clear')}
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 max-h-80 overflow-y-auto text-left space-y-1">
            {searchResults.length > 0 ? (
              searchResults.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => {
                    onNavigate(`tool/${tool.slug}`);
                    setQuery('');
                    onSearchQuery('');
                  }}
                  className="p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {tool.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{tool.shortDescription}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                {t('hero.noToolsFound', 'No tools found for "{query}". Try searching "invoice", "qr", "uuid" or "color".').replace('{query}', query)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular Shortcuts */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold mr-1">{t('hero.popular', 'Popular:')}</span>
        {quickShortcuts.map((sc) => (
          <button
            key={sc.slug}
            onClick={() => onNavigate(sc.slug)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/90 dark:border-slate-800 transition-colors font-medium shadow-2xs"
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Value Proposition Badges */}
      <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          <span>{t('hero.badgeInstant', 'Zero Page Reloads • Instant Execution')}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('hero.badgePrivacy', '100% Client-Side Privacy')}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Wrench className="w-4 h-4 text-indigo-400" />
          <span>{t('hero.badgeModular', 'Geometric Modular Architecture')}</span>
        </div>
      </div>
    </section>
  );
}

