import React, { useState } from 'react';
import { Target, FileText, Image, Code, ArrowLeftRight, Briefcase, Sparkles, ChevronRight } from 'lucide-react';
import { ToolDefinition } from '../types/tool';
import { ToolGoal, getToolsByGoal } from '../config/toolsRegistry';
import ToolCard from './ToolCard';
import { useTranslation } from '../i18n/i18nContext';

interface HomeGoalsSectionProps {
  favoriteIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigate: (slug: string) => void;
}

interface GoalMeta {
  id: ToolGoal;
  icon: React.ElementType;
  titleKey: string;
  defaultTitle: string;
  accentColor: string;
}

export default function HomeGoalsSection({
  favoriteIds,
  onToggleFavorite,
  onNavigate,
}: HomeGoalsSectionProps) {
  const { t } = useTranslation();
  const [activeGoal, setActiveGoal] = useState<ToolGoal | 'all'>('all');

  const goals: GoalMeta[] = [
    {
      id: 'documents',
      icon: FileText,
      titleKey: 'goal.documents',
      defaultTitle: 'Criar documentos',
      accentColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'media',
      icon: Image,
      titleKey: 'goal.media',
      defaultTitle: 'Trabalhar com imagens',
      accentColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'develop',
      icon: Code,
      titleKey: 'goal.develop',
      defaultTitle: 'Desenvolver',
      accentColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'convert',
      icon: ArrowLeftRight,
      titleKey: 'goal.convert',
      defaultTitle: 'Converter arquivos',
      accentColor: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
    },
    {
      id: 'marketing',
      icon: Briefcase,
      titleKey: 'goal.marketing',
      defaultTitle: 'Marketing e negócios',
      accentColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('home.goalsTitle', 'Ferramentas por Objetivo')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('home.goalsSubtitle', 'Encontre a ferramenta exata para o seu fluxo de trabalho atual.')}
            </p>
          </div>
        </div>

        {/* Goal Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveGoal('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeGoal === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {t('goal.all', 'Todos os Objetivos')}
          </button>
          {goals.map((g) => {
            const IconComponent = g.icon;
            const isActive = activeGoal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGoal(g.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{t(g.titleKey, g.defaultTitle)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Content Grid */}
      {activeGoal === 'all' ? (
        <div className="space-y-8">
          {goals.map((g) => {
            const IconComponent = g.icon;
            const toolsForGoal = getToolsByGoal(g.id);
            if (toolsForGoal.length === 0) return null;

            return (
              <div key={g.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border text-xs ${g.accentColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {t(g.titleKey, g.defaultTitle)}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-800">
                      {toolsForGoal.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveGoal(g.id)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <span>{t('action.viewCategory', 'Ver todas')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toolsForGoal.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={favoriteIds.includes(tool.id)}
                      onToggleFavorite={onToggleFavorite}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getToolsByGoal(activeGoal).map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favoriteIds.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
