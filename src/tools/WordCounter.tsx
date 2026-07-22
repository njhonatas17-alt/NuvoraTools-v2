import React, { useState } from 'react';
import { Copy, Check, Trash2, ArrowUpDown, Clock, FileText, Sparkles, Sliders } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';

export default function WordCounter() {
  const [text, setText] = useState(
    "NuvoraTools is a modern, fast, SEO-friendly utility platform designed to empower developers, writers, and digital professionals with instant browser-based tools. From AI invoice generation to color picking and word counting, everything runs locally with zero delay."
  );
  const [copied, setCopied] = useState(false);

  // Stats calculation
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const charsWithSpace = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = trimmed ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = trimmed ? text.split(/\n+/).filter(Boolean).length : 0;

  // Reading time (200 wpm) & Speaking time (130 wpm)
  const readingSeconds = Math.ceil((words / 200) * 60);
  const speakingSeconds = Math.ceil((words / 130) * 60);

  const formatTime = (totalSec: number) => {
    if (totalSec < 60) return `${totalSec}s`;
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s}s`;
  };

  // Keyword density
  const getTopKeywords = () => {
    if (!trimmed) return [];
    const cleanWords = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const freq: Record<string, number> = {};
    cleanWords.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        percent: ((count / (cleanWords.length || 1)) * 100).toFixed(1),
      }));
  };

  const topKeywords = getTopKeywords();

  // Case transformations
  const transformCase = (type: string) => {
    let result = text;
    switch (type) {
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'title':
        result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        break;
      case 'kebab':
        result = text
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-');
        break;
      case 'snake':
        result = text
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '_');
        break;
      case 'clean':
        result = text.replace(/\s+/g, ' ').trim();
        break;
    }
    setText(result);
  };

  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Words', val: words, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Chars (with space)', val: charsWithSpace, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Chars (no space)', val: charsNoSpace, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Sentences', val: sentences, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Paragraphs', val: paragraphs, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Read Time', val: formatTime(readingSeconds), color: 'text-rose-600 dark:text-rose-400' },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-sm">
            <span className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              {m.label}
            </span>
            <span className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</span>
          </div>
        ))}
      </div>

      {/* Main Textarea Area */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Type or Paste Text Below</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setText('')}
              className="px-3 py-1.5 text-xs text-neutral-500 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your content here to calculate word count, reading time, and transform text case..."
          className="w-full p-4 text-sm font-sans rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
        />

        {/* Text Transformations */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <span className="block text-xs font-semibold text-neutral-500 uppercase">Case Converters & Tools</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: 'upper', label: 'UPPERCASE' },
              { id: 'lower', label: 'lowercase' },
              { id: 'title', label: 'Title Case' },
              { id: 'sentence', label: 'Sentence case' },
              { id: 'camel', label: 'camelCase' },
              { id: 'kebab', label: 'kebab-case' },
              { id: 'snake', label: 'snake_case' },
              { id: 'clean', label: 'Remove Extra Spaces' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => transformCase(btn.id)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword Density Table */}
      {topKeywords.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Top Keyword Density Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {topKeywords.map((kw, i) => (
              <div key={i} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 flex justify-between items-center">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{kw.word}</span>
                <span className="text-neutral-500 font-mono">{kw.count} ({kw.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
