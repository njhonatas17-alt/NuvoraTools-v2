import React from 'react';
import { Star, ArrowUpRight } from 'lucide-react';
import { ToolDefinition } from '../types/tool';
import DynamicIcon from './DynamicIcon';
import { useTranslation } from '../i18n/i18nContext';

interface ToolCardProps {
  key?: React.Key;
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigate: (slug: string) => void;
}

export default function ToolCard({ tool, isFavorite, onToggleFavorite, onNavigate }: ToolCardProps) {
  const { t } = useTranslation();

  const title = t(`tool.${tool.id}.title`, tool.title);
  const desc = t(`tool.${tool.id}.desc`, tool.shortDescription);
  const categoryName = t(`cat.${tool.category}.name`, tool.category);
  const badgeText = tool.badge ? t(`badge.${tool.badge.toLowerCase()}`, tool.badge) : '';

  return (
    <div
      onClick={() => onNavigate(`tool/${tool.slug}`)}
      className="group relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Icon, Badge, Favorite Star */}
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-105 transition-transform">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            {tool.badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  tool.badge === 'AI'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                    : tool.badge === 'Popular'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {badgeText}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => onToggleFavorite(tool.id, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFavorite ? t('action.removeFavorite', 'Remove from favorites') : t('action.addFavorite', 'Add to favorites')}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Short Description */}
        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
          <span>{title}</span>
          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0 ml-1" />
        </h3>

        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Footer Tags */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        <span className="capitalize font-semibold text-slate-400 dark:text-slate-500">
          {categoryName}
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          {t('grid.openTool', 'Open Tool →')}
        </span>
      </div>
    </div>
  );
}
