import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, Shield, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';
import { useTranslation } from '../i18n/i18nContext';

export default function PasswordGenerator() {
  const { t } = useTranslation();
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [mode, setMode] = useState<'random' | 'passphrase'>('random');
  const [wordCount, setWordCount] = useState(4);

  const [password, setPassword] = useState('');
  const [bulkList, setBulkList] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedBulk, setCopiedBulk] = useState(false);

  const words = [
    'alpha', 'beacon', 'cactus', 'delta', 'echo', 'falcon', 'galaxy', 'horizon',
    'iguana', 'jungle', 'kilo', 'lunar', 'matrix', 'nectar', 'orchid', 'pioneer',
    'quartz', 'radar', 'shadow', 'timber', 'umbrella', 'vortex', 'whisper', 'xenon',
    'yacht', 'zephyr', 'amber', 'breeze', 'crypto', 'dynamic', 'emerald', 'frost'
  ];

  const generateSinglePassword = (): string => {
    if (mode === 'passphrase') {
      const selectedWords: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        selectedWords.push(words[randomIndex]);
      }
      return selectedWords.join('-');
    }

    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let nums = '0123456789';
    let syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[il]/g, '');
      nums = nums.replace(/[01]/g, '');
    }

    let charset = '';
    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += nums;
    if (includeSymbols) charset += syms;

    if (!charset) charset = lower;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    return result;
  };

  const handleGenerate = () => {
    const mainPass = generateSinglePassword();
    setPassword(mainPass);

    // Also generate 5 bulk variations
    const bulk = Array.from({ length: 5 }, () => generateSinglePassword());
    setBulkList(bulk);
  };

  useEffect(() => {
    handleGenerate();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, mode, wordCount]);

  // Estimate entropy and strength
  const calculateStrength = () => {
    if (mode === 'passphrase') {
      const entropy = wordCount * Math.log2(words.length);
      if (entropy > 50) return { label: t('pass.veryStrong', 'Very Strong'), score: 4, color: 'text-emerald-500', bg: 'bg-emerald-500', crack: t('pass.centuries', 'Centuries') };
      return { label: t('pass.good', 'Good'), score: 3, color: 'text-blue-500', bg: 'bg-blue-500', crack: t('pass.years', 'Years') };
    }

    let pool = 0;
    if (includeUpper) pool += 26;
    if (includeLower) pool += 26;
    if (includeNumbers) pool += 10;
    if (includeSymbols) pool += 25;

    const entropy = length * Math.log2(pool || 1);

    if (entropy < 30) return { label: t('pass.weak', 'Weak'), score: 1, color: 'text-red-500', bg: 'bg-red-500', crack: t('pass.crackInstant', 'Instant - Minutes') };
    if (entropy < 55) return { label: t('pass.fair', 'Fair'), score: 2, color: 'text-amber-500', bg: 'bg-amber-500', crack: t('pass.crackDays', 'Few Days') };
    if (entropy < 80) return { label: t('pass.strong', 'Strong'), score: 3, color: 'text-blue-500', bg: 'bg-blue-500', crack: t('pass.crackDecades', 'Decades') };
    return { label: t('pass.veryStrong', 'Very Strong'), score: 4, color: 'text-emerald-500', bg: 'bg-emerald-500', crack: t('pass.crackTrillions', 'Trillions of Years') };
  };

  const strength = calculateStrength();

  const handleCopyMain = () => {
    copyToClipboard(password);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBulk = () => {
    copyToClipboard(bulkList.join('\n'));
    setCopiedBulk(true);
    triggerConfetti();
    setTimeout(() => setCopiedBulk(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Primary Display & Action Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${strength.color}`} />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {t('pass.generatedPassword', 'Generated Password')}
            </span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${strength.color} bg-neutral-100 dark:bg-neutral-800`}>
            {strength.label}
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full px-4 py-3.5 text-lg font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white pr-28 select-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              onClick={handleGenerate}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
              title={t('pass.regenerate', 'Regenerate')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleCopyMain}
              className="px-3.5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('action.copied', 'Copied') : t('action.copy', 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Strength Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>{t('pass.crackTime', 'Estimated Crack Time')}</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{strength.crack}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`rounded-full transition-all duration-300 ${
                  step <= strength.score ? strength.bg : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mode & Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {t('pass.mode', 'Generator Mode')}
            </h3>
            <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl text-xs">
              <button
                onClick={() => setMode('random')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  mode === 'random' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500'
                }`}
              >
                {t('pass.random', 'Random')}
              </button>
              <button
                onClick={() => setMode('passphrase')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  mode === 'passphrase' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500'
                }`}
              >
                {t('pass.passphrase', 'Passphrase')}
              </button>
            </div>
          </div>

          {mode === 'random' ? (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium">{t('pass.length', 'Password Length')}</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono text-sm">{length} chars</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: t('pass.uppercase', 'Uppercase (A-Z)'), value: includeUpper, setter: setIncludeUpper },
                  { label: t('pass.lowercase', 'Lowercase (a-z)'), value: includeLower, setter: setIncludeLower },
                  { label: t('pass.numbers', 'Numbers (0-9)'), value: includeNumbers, setter: setIncludeNumbers },
                  { label: t('pass.symbols', 'Symbols (!@#$%)'), value: includeSymbols, setter: setIncludeSymbols },
                ].map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
                    <input
                      type="checkbox"
                      checked={opt.value}
                      onChange={(e) => opt.setter(e.target.checked)}
                      className="rounded accent-blue-600 w-4 h-4"
                    />
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{opt.label}</span>
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded accent-blue-600 w-4 h-4"
                />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {t('pass.excludeAmbiguous', 'Exclude Ambiguous (1, l, I, 0, O)')}
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-neutral-600 dark:text-neutral-400 font-medium">{t('pass.wordCount', 'Word Count')}</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono text-sm">{wordCount} words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <p className="text-neutral-500 leading-relaxed">
                {t('pass.passphraseHelp', 'Passphrases combine dictionary words separated by hyphens. They are exceptionally easy to memorize while maintaining massive cryptographic resistance against brute force!')}
              </p>
            </div>
          )}
        </div>

        {/* Bulk Passwords Box */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {t('pass.batchOptions', 'Batch Options')}
            </h3>
            <button
              onClick={handleCopyBulk}
              className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              {copiedBulk ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBulk ? t('pass.copiedAll', 'Copied All') : t('pass.copyBatch', 'Copy All Batch')}</span>
            </button>
          </div>

          <div className="space-y-2">
            {bulkList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  copyToClipboard(item);
                  triggerConfetti();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-neutral-200/60 dark:border-neutral-800/60 font-mono text-xs cursor-pointer group transition-colors"
                title={t('pass.clickToCopy', 'Click to copy this password')}
              >
                <span className="truncate mr-2">{item}</span>
                <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
