import React from 'react';
import { CATEGORIES } from '../config/toolsRegistry';
import { ToolCategory } from '../types/tool';
import DynamicIcon from './DynamicIcon';
import { useTranslation } from '../i18n/i18nContext';

interface CategoryGridProps {
  activeCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  toolCountByCategory: Record<string, number>;
}

export default function CategoryGrid({ activeCategory, onSelectCategory, toolCountByCategory }: CategoryGridProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('cat.title', 'Browse Categories')}
        </h2>
        {activeCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            {t('cat.clear', 'Clear Filter (Show All)')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const count = toolCountByCategory[cat.id] || 0;
          const translatedName = t(`cat.${cat.id}.name`, cat.name);
          const translatedDesc = t(`cat.${cat.id}.desc`, cat.description);
          const toolsLabel = t('cat.toolsCount', 'tools');

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 text-slate-900 dark:text-white shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`p-2 rounded-lg text-xs ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <DynamicIcon name={cat.iconName} className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count} {toolsLabel}
                </span>
              </div>

              <h3 className="text-sm font-bold tracking-tight">{translatedName}</h3>
              <p
                className={`text-[11px] mt-1 line-clamp-2 ${
                  isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {translatedDesc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
