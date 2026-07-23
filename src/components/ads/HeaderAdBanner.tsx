import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTranslation } from '../../i18n/i18nContext';

interface AdProps {
  slotId?: string;
  className?: string;
}

export function HeaderAdBanner({ slotId = 'header-banner', className = '' }: AdProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 my-4 ${className}`}>
      <div className="relative rounded-xl bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {t('ad.container', 'Ad Container')}
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{t('ad.space', 'Advertisement Space:')}</strong> {t('ad.spaceDesc', 'Designated for non-intrusive, privacy-friendly sponsor messages.')}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          aria-label="Dismiss advertisement banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function SidebarAd({ slotId = 'sidebar-ad', className = '' }: AdProps) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3 text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-slate-400">{t('ad.container', 'Ad Container')}</span>
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white">{t('ad.sponsoredPlacement', 'Sponsored Placement')}</h4>
      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
        {t('ad.sidebarDesc', 'Tasteful advertisement space available for developer tools and privacy-first web services.')}
      </p>
      <div className="w-full py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold text-center">
        {t('ad.placeholder', 'Ad Slot Placeholder')}
      </div>
    </div>
  );
}

export function InContentAd({ slotId = 'in-content-ad', className = '' }: AdProps) {
  const { t } = useTranslation();
  return (
    <div className={`my-8 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
          {t('ad.badge', 'Ad')}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">{t('ad.spaceTitle', 'Advertisement Space')}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{t('ad.privacyDesc', 'Privacy-respecting sponsor slot • No user tracking cookies used.')}</p>
        </div>
      </div>
      <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium shrink-0">
        {t('ad.placeholderContainer', 'Placeholder Container')}
      </span>
    </div>
  );
}

export function FooterAd({ slotId = 'footer-ad', className = '' }: AdProps) {
  const { t } = useTranslation();
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 my-6 ${className}`}>
      <div className="rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-3 text-center text-[11px] text-slate-500">
        <span>{t('ad.footerPlaceholder', 'Sponsored Ad Space Placeholder • 100% Client-side browser execution')}</span>
      </div>
    </div>
  );
}
