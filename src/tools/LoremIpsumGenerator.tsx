import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, FileText, Download } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';
import { useTranslation } from '../i18n/i18nContext';

type UnitType = 'paragraphs' | 'words' | 'sentences' | 'list';
type StyleType = 'latin' | 'developer' | 'startup';

export default function LoremIpsumGenerator() {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<UnitType>('paragraphs');
  const [count, setCount] = useState(3);
  const [style, setStyle] = useState<StyleType>('latin');
  const [htmlTags, setHtmlTags] = useState(false);
  const [startWithLorem, setStartWithLorem] = useState(true);

  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const latinWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
    'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
    'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum',
    'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
    'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const devWords = [
    'typescript', 'react', 'tailwind', 'component', 'async', 'promise', 'closure',
    'state', 'props', 'vite', 'node', 'express', 'rest', 'api', 'graphql', 'container',
    'docker', 'kubernetes', 'refactor', 'deploy', 'pipeline', 'middleware', 'hook',
    'useEffect', 'useState', 'monorepo', 'tree', 'git', 'commit', 'branch', 'merge', 'pr'
  ];

  const startupWords = [
    'synergy', 'pivot', 'bandwidth', 'disrupt', 'scalability', 'freemium', 'paradigm',
    'monetize', 'leverage', 'actionable', 'roadmap', 'growth-hacking', 'ecosystem',
    'traction', 'deck', 'bootstrapped', 'venture', 'angel', 'series-a', 'roi', 'kpi'
  ];

  const getDictionary = () => {
    if (style === 'developer') return devWords;
    if (style === 'startup') return startupWords;
    return latinWords;
  };

  const generateSentence = (dict: string[], minWords = 8, maxWords = 15): string => {
    const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      words.push(dict[Math.floor(Math.random() * dict.length)]);
    }
    const sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = (dict: string[]): string => {
    const sentencesCount = Math.floor(Math.random() * 3) + 4; // 4 to 6 sentences
    const sentences: string[] = [];
    for (let i = 0; i < sentencesCount; i++) {
      sentences.push(generateSentence(dict));
    }
    return sentences.join(' ');
  };

  const handleGenerate = () => {
    const dict = getDictionary();
    let resultBlocks: string[] = [];

    if (unit === 'paragraphs') {
      for (let i = 0; i < count; i++) {
        let p = generateParagraph(dict);
        if (i === 0 && startWithLorem && style === 'latin') {
          p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + p;
        }
        if (htmlTags) p = `<p>${p}</p>`;
        resultBlocks.push(p);
      }
    } else if (unit === 'words') {
      const totalWords: string[] = [];
      if (startWithLorem && style === 'latin') {
        totalWords.push('lorem', 'ipsum', 'dolor', 'sit', 'amet');
      }
      while (totalWords.length < count) {
        totalWords.push(dict[Math.floor(Math.random() * dict.length)]);
      }
      let textStr = totalWords.slice(0, count).join(' ');
      if (htmlTags) textStr = `<p>${textStr}</p>`;
      resultBlocks.push(textStr);
    } else if (unit === 'sentences') {
      for (let i = 0; i < count; i++) {
        let s = generateSentence(dict);
        if (i === 0 && startWithLorem && style === 'latin') {
          s = 'Lorem ipsum dolor sit amet. ' + s;
        }
        if (htmlTags) s = `<p>${s}</p>`;
        resultBlocks.push(s);
      }
    } else if (unit === 'list') {
      for (let i = 0; i < count; i++) {
        let item = generateSentence(dict, 4, 8).replace('.', '');
        if (htmlTags) item = `<li>${item}</li>`;
        resultBlocks.push(item);
      }
      if (htmlTags) {
        resultBlocks = ['<ul>', ...resultBlocks, '</ul>'];
      }
    }

    setOutput(resultBlocks.join('\n\n'));
  };

  useEffect(() => {
    handleGenerate();
  }, [unit, count, style, htmlTags, startWithLorem]);

  const handleCopy = () => {
    copyToClipboard(output);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">{t('lorem.style', 'Style')}</label>
            <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl text-xs">
              {[
                { id: 'latin', label: t('lorem.latin', 'Classic Latin') },
                { id: 'developer', label: t('lorem.developer', 'Developer Jargon') },
                { id: 'startup', label: t('lorem.startup', 'Startup Tech') },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id as any)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    style === s.id ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">{t('lorem.unitType', 'Unit Type')}</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            >
              <option value="paragraphs">{t('lorem.paragraphs', 'Paragraphs')}</option>
              <option value="sentences">{t('lorem.sentences', 'Sentences')}</option>
              <option value="words">{t('lorem.words', 'Words')}</option>
              <option value="list">{t('lorem.bulletList', 'Bullet List Items')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
              {t('lorem.count', 'Count')} ({count})
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer mt-1"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded accent-blue-600 w-4 h-4"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {t('lorem.startWithLorem', 'Start with "Lorem ipsum..."')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={htmlTags}
                onChange={(e) => setHtmlTags(e.target.checked)}
                className="rounded accent-blue-600 w-4 h-4"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {t('lorem.wrapHtml', 'Wrap in HTML Tags')}
              </span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            className="px-3.5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('lorem.generateFresh', 'Generate Fresh')}</span>
          </button>
        </div>
      </div>

      {/* Output Display */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
            <span>{wordCount} {t('wordCounter.words', 'Words')}</span>
            <span>•</span>
            <span>{charCount} {t('wordCounter.characters', 'Characters')}</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('action.copiedText', 'Copied Text') : t('action.copyText', 'Copy Text')}</span>
          </button>
        </div>

        <textarea
          readOnly
          rows={10}
          value={output}
          className="w-full p-4 text-sm font-sans rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 focus:outline-none resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}
