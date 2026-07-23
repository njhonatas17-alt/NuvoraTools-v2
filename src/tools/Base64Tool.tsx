import React, { useState } from 'react';
import { BaseToolWrapper, useToolState } from './templates';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const {
    input,
    setInput,
    output,
    loading,
    error,
    successMsg,
    copied,
    copyToClipboard,
    downloadOutput,
    executeAction,
    reset,
  } = useToolState<string, string>({
    toolId: 'base64-encoder-decoder',
    initialInput: '',
    onValidate: (val) => {
      if (!val || val.trim().length === 0) {
        return 'Please enter text or Base64 string to process.';
      }
      return null;
    },
    onProcess: (val) => {
      if (mode === 'encode') {
        return btoa(unescape(encodeURIComponent(val)));
      } else {
        try {
          return decodeURIComponent(escape(atob(val.trim())));
        } catch (e) {
          throw new Error('Invalid Base64 string provided for decoding.');
        }
      }
    },
  });

  return (
    <BaseToolWrapper
      toolId="base64-encoder-decoder"
      title="Base64 Encoder / Decoder"
      description="Encode plain text into Base64 or decode Base64 strings back to text instantly in your browser."
      badge="Utility"
      categoryName="Developer"
      difficulty="beginner"
      loading={loading}
      error={error}
      successMsg={successMsg}
      copied={copied}
      executeLabel={mode === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
      onExecute={() => executeAction()}
      onReset={reset}
      onCopy={output ? () => copyToClipboard() : undefined}
      onDownload={output ? () => downloadOutput(`base64-${mode}.txt`) : undefined}
      inputControls={
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setMode('encode')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'encode'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Encode (Text ➔ Base64)
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'decode'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Decode (Base64 ➔ Text)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 String to Decode'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'Paste text here (e.g., Hello NuvoraTools)...'
                  : 'Paste Base64 string here (e.g., SGVsbG8gTnV2b3JhVG9vbHM=)...'
              }
              rows={6}
              className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      }
      outputDisplay={
        output ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500">Result</label>
            <textarea
              readOnly
              value={output}
              rows={6}
              className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-400 italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8">
            Click process to generate output
          </div>
        )
      }
    />
  );
}
