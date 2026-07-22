import React, { useState } from 'react';
import { Shield, FileText, Mail, HelpCircle, CheckCircle2, Wrench, Send } from 'lucide-react';
import { triggerConfetti } from '../lib/utils';
import { useTranslation } from '../i18n/i18nContext';

interface StaticPagesProps {
  page: 'about' | 'contact' | 'privacy' | 'terms' | 'faq';
  onNavigate: (route: string) => void;
}

export default function StaticPages({ page, onNavigate }: StaticPagesProps) {
  const { t } = useTranslation();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) return;
    setContactSubmitted(true);
    triggerConfetti();
  };

  if (page === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
            {t('about.tag', 'About NuvoraTools')}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('about.title', 'Fast, Private & Free Web Utility Suite')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('about.desc', 'NuvoraTools is built to eliminate slow, bloatware-filled online converter websites. We deliver lightweight, client-side tools with zero ads or user tracking.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('about.clientSideTitle', '100% Client-Side')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('about.clientSideDesc', 'Your calculations, invoice data, and passwords remain in your browser storage. Nothing is saved to external servers.')}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('about.scalabilityTitle', 'Infinite Scalability')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('about.scalabilityDesc', 'Designed with a unified tool registry architecture so developers can expand from 10 to 500+ utilities seamlessly.')}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('about.aiTitle', 'AI Enhanced')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('about.aiDesc', 'Integrates cutting-edge AI models for intelligent invoice parsing and context-aware transformations.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('contact.title', 'Contact & Tool Requests')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('contact.desc', 'Have a suggestion for a new tool or bug report? Send us a message!')}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          {contactSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('contact.successTitle', 'Message Sent Successfully!')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('contact.successDesc', 'Thank you for reaching out. We review all feedback to add new tools.')}
              </p>
              <button
                onClick={() => setContactSubmitted(false)}
                className="mt-4 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg font-semibold"
              >
                {t('contact.sendAnother', 'Send Another Message')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  {t('contact.nameLabel', 'Your Name')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  {t('contact.emailLabel', 'Email Address')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  {t('contact.msgLabel', 'Message / Feature Request')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={t('contact.msgPlaceholder', 'Describe your requested utility tool or feedback...')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{t('contact.submitBtn', 'Submit Message')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('privacy.title', 'Privacy Policy')}
        </h1>
        <p>{t('privacy.updated', 'Last updated: July 2026')}</p>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('privacy.s1Title', '1. Client-Side Data Guarantee')}
          </h2>
          <p>
            {t('privacy.s1Desc', 'NuvoraTools is architected to execute calculations, code formatting, invoice generation, and conversions locally inside your client web browser. We do not transmit or store your inputted financial, personal, or cryptographic data on external databases.')}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('privacy.s2Title', '2. Local Storage Usage')}
          </h2>
          <p>
            {t('privacy.s2Desc', 'We use standard browser localStorage purely to remember your user interface preferences (such as Light/Dark mode), favorite tools list, and recently used tools array. This data remains on your device.')}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {t('terms.title', 'Terms of Service')}
      </h1>
      <p>
        {t('terms.desc', 'NuvoraTools provides developer tools and utilities free of charge on an "AS IS" basis. Users are responsible for verifying generated invoices, calculations, and security keys.')}
      </p>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return <Wrench className={className} />;
}
function ShieldCheck({ className }: { className?: string }) {
  return <Shield className={className} />;
}
function Sparkles({ className }: { className?: string }) {
  return <FileText className={className} />;
}
