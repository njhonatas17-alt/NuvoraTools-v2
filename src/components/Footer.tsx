import React from 'react';
import { Shield } from 'lucide-react';
import ToolHubLogo from './ToolHubLogo';
import { CATEGORIES, TOOLS_REGISTRY } from '../config/toolsRegistry';
import { FooterAd } from './ads/HeaderAdBanner';
import { useTranslation } from '../i18n/i18nContext';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors mt-20">
      <FooterAd />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <div
              onClick={() => onNavigate('')}
              className="inline-block cursor-pointer group"
            >
              <ToolHubLogo size="md" />
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              {t('footer.desc', 'Free, modern, browser-based utilities built for developers, designers, and content creators. No ads, no backend delay, 100% client-side privacy.')}
            </p>
          </div>

          {/* Categories Column */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t('footer.categories', 'Categories')}
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`category/${cat.id}`)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {t(`cat.${cat.id}.name`, cat.name)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools Column */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t('footer.popular', 'Popular Utilities')}
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              {TOOLS_REGISTRY.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(`tool/${tool.slug}`)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-xs block text-left"
                  >
                    {t(`tool.${tool.id}.title`, tool.title)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Pages */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {t('footer.company', 'Company & Legal')}
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {t('footer.aboutUs', 'About Us')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {t('footer.contact', 'Contact & Requests')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {t('footer.privacy', 'Privacy Policy')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {t('footer.terms', 'Terms of Service')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© {new Date().getFullYear()} NuvoraTools. {t('footer.copyright', 'All tools free forever under MIT License.')}</p>
          <div className="flex items-center gap-2 font-medium text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{t('footer.privateNote', '100% Private — Everything runs securely in your browser. Your data never leaves your device.')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
