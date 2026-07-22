import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, RefreshCw, Hash, FileCode } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';
import { useTranslation } from '../i18n/i18nContext';

export default function UuidGenerator() {
  const { t } = useTranslation();
  const [version, setVersion] = useState<'v4' | 'v1' | 'v7'>('v4');
  const [quantity, setQuantity] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [quotes, setQuotes] = useState(false);

  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUuidV4 = (): string => {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  };

  const generateUuidV1 = (): string => {
    // Simulated time-based UUID v1 layout
    const now = Date.now();
    const timeHex = (now * 10000 + 122192928000000000).toString(16).padStart(15, '0');
    const timeLow = timeHex.slice(-8);
    const timeMid = timeHex.slice(-12, -8);
    const timeHi = '1' + timeHex.slice(0, 3);
    const clockSeq = Math.floor(Math.random() * 0x3fff | 0x8000).toString(16);
    const node = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
  };

  const generateUuidV7 = (): string => {
    // Unix Epoch timestamp sortable v7
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const randA = Math.floor(Math.random() * 0x0fff | 0x7000).toString(16);
    const randB = Math.floor(Math.random() * 0x3fff | 0x8000).toString(16);
    const randNode = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${randA}-${randB}-${randNode}`;
  };

  const generateBatch = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let raw = '';
      if (version === 'v4') raw = generateUuidV4();
      else if (version === 'v1') raw = generateUuidV1();
      else raw = generateUuidV7();

      if (!hyphens) raw = raw.replace(/-/g, '');
      if (uppercase) raw = raw.toUpperCase();
      if (braces) raw = `{${raw}}`;
      if (quotes) raw = `"${raw}"`;

      list.push(raw);
    }
    setUuids(list);
  };

  useEffect(() => {
    generateBatch();
  }, [version, quantity, uppercase, hyphens, braces, quotes]);

  const handleCopySingle = (text: string, idx: number) => {
    copyToClipboard(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    copyToClipboard(uuids.join('\n'));
    setCopiedAll(true);
    triggerConfetti();
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([uuids.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `uuids_${version}_${quantity}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    triggerConfetti();
  };

  const downloadJson = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(uuids, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `uuids_${version}_${quantity}.json`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    triggerConfetti();
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase">{t('uuid.version', 'Version')}</span>
            <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl text-xs">
              {[
                { id: 'v4', label: t('uuid.v4', 'UUID v4 (Random)') },
                { id: 'v1', label: t('uuid.v1', 'UUID v1 (Time)') },
                { id: 'v7', label: t('uuid.v7', 'UUID v7 (Epoch Sortable)') },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVersion(v.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    version === v.id ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateBatch}
              className="px-3.5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('uuid.regenerate', 'Regenerate')}</span>
            </button>
          </div>
        </div>

        {/* Form Options */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-neutral-500 mb-1">{t('uuid.quantity', 'Quantity')} ({quantity})</label>
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {[
            { label: t('uuid.uppercase', 'Uppercase'), value: uppercase, setter: setUppercase },
            { label: t('uuid.hyphens', 'Hyphens'), value: hyphens, setter: setHyphens },
            { label: t('uuid.braces', 'Braces {}'), value: braces, setter: setBraces },
            { label: t('uuid.quotes', 'Quotes ""'), value: quotes, setter: setQuotes },
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
      </div>

      {/* UUID List Output */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase">
            {t('uuid.generatedList', 'Generated List')} ({uuids.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? t('action.copiedAll', 'Copied All') : t('action.copyAll', 'Copy All')}</span>
            </button>
            <button
              onClick={downloadTxt}
              className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>
            <button
              onClick={downloadJson}
              className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {uuids.map((id, index) => (
            <div
              key={index}
              onClick={() => handleCopySingle(id, index)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-neutral-200/60 dark:border-neutral-800/60 font-mono text-xs cursor-pointer group transition-colors"
            >
              <span className="text-neutral-900 dark:text-neutral-200">{id}</span>
              {copiedIndex === index ? (
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {t('action.copied', 'Copied')}
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
