import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['⌘', 'K'], label: t('shortcuts.searchModal', 'Open search modal') },
    { keys: ['/'], label: t('shortcuts.focusSearch', 'Focus search bar') },
    { keys: ['?'], label: t('shortcuts.openModal', 'Open keyboard shortcuts modal') },
    { keys: ['Esc'], label: t('shortcuts.closeModal', 'Close modals & drawers') },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <h2 id="shortcuts-modal-title" className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('nav.shortcuts', 'Keyboard Shortcuts')}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{sc.label}</span>
              <div className="flex gap-1">
                {sc.keys.map((k, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2 text-[11px] text-slate-400">
          {t('shortcuts.dismissNote', 'Press Esc anytime to dismiss modals.')}
        </div>
      </div>
    </div>
  );
}
