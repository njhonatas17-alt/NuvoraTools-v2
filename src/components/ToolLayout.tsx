import React, { useState, useEffect, Suspense } from 'react';
import { ChevronRight, Star, Share2, Check, ArrowRight, History } from 'lucide-react';
import { ToolDefinition } from '../types/tool';
import DynamicIcon from './DynamicIcon';
import ToolCard from './ToolCard';
import ToolLoadingSkeleton from './ToolLoadingSkeleton';
import ToolSEOSection from './ToolSEOSection';
import { copyToClipboard, triggerConfetti } from '../lib/utils';
import { updateSEO } from '../lib/seo';
import { trackToolUsage } from '../lib/analytics';
import { getRelatedTools, getToolBySlug } from '../config/toolsRegistry';
import { getToolSEOContent } from '../content/registry';
import { InContentAd } from './ads/HeaderAdBanner';
import { useTranslation } from '../i18n/i18nContext';

interface ToolLayoutProps {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigate: (route: string) => void;
  recentlyUsedIds: string[];
}

export default function ToolLayout({
  tool,
  isFavorite,
  onToggleFavorite,
  onNavigate,
  recentlyUsedIds,
}: ToolLayoutProps) {
  const { t } = useTranslation();
  const [shared, setShared] = useState(false);

  const ToolComponent = tool.component;
  const relatedTools = getRelatedTools(tool.id);
  const seoContent = getToolSEOContent(tool);

  const translatedTitle = t(`tool.${tool.id}.title`, tool.title);
  const translatedDesc = t(`tool.${tool.id}.desc`, tool.shortDescription);
  const categoryName = t(`cat.${tool.category}.name`, tool.category);
  const badgeText = tool.badge ? t(`badge.${tool.badge.toLowerCase()}`, tool.badge) : '';

  // Filter recently used tools excluding current tool
  const recentTools = recentlyUsedIds
    .filter((id) => id !== tool.id)
    .map((id) => getToolBySlug(id))
    .filter((t): t is ToolDefinition => Boolean(t))
    .slice(0, 4);

  // Update page title, meta description, and JSON-LD schema dynamically for SEO
  useEffect(() => {
    updateSEO({
      title: seoContent.seoTitle || tool.seo.metaTitle,
      description: seoContent.metaDescription || tool.seo.metaDescription,
      keywords: seoContent.keywords || tool.seo.keywords,
      tool: tool,
      seoContent: seoContent,
    });
    trackToolUsage(tool.slug, 'view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tool, seoContent]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: seoContent.seoTitle || tool.seo.metaTitle,
          text: translatedDesc,
          url,
        });
        return;
      } catch (e) {
        // Fallback to copy
      }
    }
    copyToClipboard(url);
    setShared(true);
    triggerConfetti();
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
          {t('nav.home', 'Home')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => onNavigate(`category/${tool.category}`)}
          className="hover:text-slate-900 dark:hover:text-white capitalize transition-colors"
        >
          {categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">{translatedTitle}</span>
      </nav>

      {/* Tool Header Banner */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white shadow-sm flex items-center justify-center shrink-0">
            <DynamicIcon name={tool.icon} className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {seoContent.h1 || translatedTitle}
              </h1>
              {tool.badge && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {translatedDesc}
            </p>
          </div>
        </div>

        {/* Action Buttons: Favorite & Share */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => onToggleFavorite(tool.id, e)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
              isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFavorite ? t('action.saved', 'Saved') : t('action.favorite', 'Favorite')}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all"
          >
            {shared ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{shared ? t('action.linkCopied', 'Link Copied') : t('action.share', 'Share')}</span>
          </button>
        </div>
      </div>

      {/* Main Tool Workspace */}
      <main className="min-h-[400px]" id="main-content">
        <Suspense fallback={<ToolLoadingSkeleton />}>
          <ToolComponent />
        </Suspense>
      </main>

      {/* Ad Space between content */}
      <InContentAd />

      {/* Full Structured Automated SEO Content Section */}
      <ToolSEOSection seoContent={seoContent} toolTitle={translatedTitle} />

      {/* Recently Used Tools */}
      {recentTools.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <History className="w-4 h-4 text-indigo-500" />
            <h3>{t('toolLayout.recentlyUsed', 'Recently Used Tools')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTools.map((t) => (
              <ToolCard
                key={t.id}
                tool={t}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                onNavigate={(slug) => onNavigate(slug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('toolLayout.relatedTools', 'Related Tools')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((t) => (
              <ToolCard
                key={t.id}
                tool={t}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                onNavigate={(slug) => onNavigate(slug)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

