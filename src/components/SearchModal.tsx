import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { searchTools } from '../config/toolsRegistry';
import DynamicIcon from './DynamicIcon';
import { useTranslation } from '../i18n/i18nContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

export default function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = searchTools(query);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keydown handler for Esc, Cmd+K, Up/Down/Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onNavigate(`tool/${results[selectedIndex].slug}`);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', 'Search tools by name, description or keyword...')}
            className="w-full text-sm bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {query.trim() ? (
            results.length > 0 ? (
              results.map((tool, idx) => {
                const isSelected = idx === selectedIndex;
                const toolTitle = t(`tool.${tool.id}.title`, tool.title);
                const toolDesc = t(`tool.${tool.id}.desc`, tool.shortDescription);

                return (
                  <div
                    key={tool.id}
                    onClick={() => {
                      onNavigate(`tool/${tool.slug}`);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <DynamicIcon name={tool.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {toolTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate max-w-sm">
                          {toolDesc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-colors ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                {t('search.noResults', 'No matching tools found.')}
              </div>
            )
          ) : (
            <div className="p-4 text-xs text-slate-400 text-center">
              {t('search.typeToSearch', 'Type to search 10+ browser-based tools. Use ↑ ↓ arrows to navigate and Enter to select.')}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>{t('search.shortcuts', 'Navigate with ↑ ↓ • Select with Enter • Press ESC to exit')}</span>
        </div>
      </div>
    </div>
  );
}
