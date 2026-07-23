import React, { memo } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Download, AlertCircle, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { ToolDifficulty } from '../../types/tool';

export interface BaseToolWrapperProps {
  toolId?: string;
  title: string;
  description: string;
  badge?: string;
  categoryName?: string;
  difficulty?: ToolDifficulty;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  
  // State props
  loading?: boolean;
  error?: string | null;
  successMsg?: string | null;
  copied?: boolean;
  
  // Action handlers
  onExecute?: () => void;
  onReset?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;

  // Custom slots
  executeLabel?: string;
  inputControls: React.ReactNode;
  outputDisplay?: React.ReactNode;
  actionsRightSlot?: React.ReactNode;
  footerInfo?: React.ReactNode;
}

export const BaseToolWrapper = memo(function BaseToolWrapper({
  toolId,
  title,
  description,
  badge,
  categoryName,
  difficulty = 'beginner',
  isFavorite = false,
  onToggleFavorite,

  loading = false,
  error,
  successMsg,
  copied = false,

  onExecute,
  onReset,
  onCopy,
  onDownload,

  executeLabel = 'Process',
  inputControls,
  outputDisplay,
  actionsRightSlot,
  footerInfo,
}: BaseToolWrapperProps) {
  const difficultyBadgeColor =
    difficulty === 'beginner'
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : difficulty === 'intermediate'
      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800';

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto" role="region" aria-label={title}>
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                {badge}
              </span>
            )}
            {categoryName && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                {categoryName}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${difficultyBadgeColor}`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Favorite Action & Privacy Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side</span>
          </div>

          {toolId && onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(toolId, e)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/80 dark:border-rose-800'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600 dark:bg-slate-950 dark:border-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages (Live Region for Accessibility) */}
      <div aria-live="polite" className="space-y-2">
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Tool Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Card */}
        <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 ${outputDisplay ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Input & Configuration
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ⌘ + Enter to run
            </span>
          </div>

          {/* Form Controls */}
          <div className="space-y-4">{inputControls}</div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {onExecute && (
                <button
                  onClick={onExecute}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Processing...' : executeLabel}</span>
                </button>
              )}

              {onReset && (
                <button
                  onClick={onReset}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {actionsRightSlot && <div>{actionsRightSlot}</div>}
          </div>
        </div>

        {/* Output Card (Rendered if outputDisplay is provided) */}
        {outputDisplay && (
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Output & Result
                </span>

                {/* Copy & Download Toolbar */}
                <div className="flex items-center gap-1.5">
                  {onCopy && (
                    <button
                      onClick={onCopy}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Copy to Clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}

                  {onDownload && (
                    <button
                      onClick={onDownload}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Output Content */}
              <div className="min-h-[160px]">{outputDisplay}</div>
            </div>

            {footerInfo && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                {footerInfo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
