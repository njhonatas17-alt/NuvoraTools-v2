import React, { useState } from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, Sparkles, BookOpen, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { ToolSEOContent } from '../types/seoContent';
import { useTranslation } from '../i18n/i18nContext';

interface ToolSEOSectionProps {
  seoContent: ToolSEOContent;
  toolTitle: string;
}

export default function ToolSEOSection({ seoContent, toolTitle }: ToolSEOSectionProps) {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default

  return (
    <article className="space-y-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
      {/* 1. Introduction Section */}
      <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-5 h-5 shrink-0" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('seoSection.about', 'About')} {toolTitle}
          </h2>
        </div>
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {seoContent.introduction}
        </div>
      </section>

      {/* 2. Step-by-Step How To Use */}
      {seoContent.howToSteps && seoContent.howToSteps.length > 0 && (
        <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5 shrink-0" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('seoSection.howTo', 'How to Use')} {toolTitle} ({t('seoSection.stepByStep', 'Step-by-Step')})
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {seoContent.howToSteps.map((step) => (
              <li
                key={step.stepNumber}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-2">
                    {step.stepNumber}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 3. Features & Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Features */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('seoSection.keyFeatures', 'Key Features')}
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {seoContent.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Benefits */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('seoSection.userBenefits', 'User Benefits')}
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {seoContent.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. Common Use Cases & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Use Cases */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Target className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('seoSection.commonCases', 'Common Use Cases')}
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {seoContent.commonUseCases.map((uc, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tips & Best Practices */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-purple-500">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('seoSection.proTips', 'Pro Tips & Best Practices')}
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {seoContent.tipsAndBestPractices.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 5. Comprehensive FAQ Accordion (8 - 10 Questions) */}
      {seoContent.faq && seoContent.faq.length > 0 && (
        <section className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('faq.title', 'Frequently Asked Questions')} ({seoContent.faq.length})
              </h2>
              <p className="text-xs text-slate-500">
                {t('seoSection.faqDesc', 'Detailed answers about privacy, usage, and compatibility.')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {seoContent.faq.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden text-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex justify-between items-center transition-colors"
                  >
                    <span className="pr-4">{item.question}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-indigo-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Conclusion */}
      {seoContent.conclusion && (
        <section className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-slate-50/80 dark:from-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-indigo-950 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            {t('seoSection.summary', 'Summary')}
          </h3>
          <p>{seoContent.conclusion}</p>
        </section>
      )}
    </article>
  );
}
