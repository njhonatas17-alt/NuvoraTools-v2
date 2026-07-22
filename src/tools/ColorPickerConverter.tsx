import React, { useState } from 'react';
import { Copy, Check, Palette, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';

export default function ColorPickerConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Helper conversions
  const hexToRgb = (h: string) => {
    let clean = h.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    const num = parseInt(clean, 16) || 0;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;
    let k = Math.min(c, Math.min(m, y));

    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
  };

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  // Luminance calculation for WCAG contrast
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWhite = (1 + 0.05) / (lum + 0.05);
  const contrastBlack = (lum + 0.05) / (0 + 0.05);

  // Generate 10 Shades & Tints
  const getShadesAndTints = () => {
    const list: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const factor = i / 10;
      const r = Math.round(rgb.r * factor);
      const g = Math.round(rgb.g * factor);
      const b = Math.round(rgb.b * factor);
      const hHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      list.push(hHex);
    }
    return list;
  };

  const shades = getShadesAndTints();

  const handleCopyValue = (fmt: string, value: string) => {
    copyToClipboard(value);
    setCopiedFormat(fmt);
    triggerConfetti();
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Primary Color Picker & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Swatch & Inputs */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-5 shadow-sm text-center">
          <div
            className="w-full h-44 rounded-2xl shadow-inner border border-neutral-200/50 flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: hex }}
          >
            <span
              className="text-lg font-mono font-bold px-4 py-1.5 rounded-xl backdrop-blur-md bg-white/30 dark:bg-black/30 text-neutral-900 dark:text-white border border-white/20"
            >
              {hex.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border-2 border-neutral-200 dark:border-neutral-700 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="px-4 py-2.5 text-base font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white uppercase"
            />
          </div>
        </div>

        {/* Color Code Formats */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Export Color Codes
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { label: 'HEX', val: hex.toUpperCase() },
              { label: 'RGB', val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
              { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
              { label: 'CMYK', val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
              { label: 'CSS Var', val: `--color-accent: ${hex};` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60">
                <span className="font-semibold text-neutral-500 w-16">{item.label}</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-200 truncate mx-2">{item.val}</span>
                <button
                  onClick={() => handleCopyValue(item.label, item.val)}
                  className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedFormat === item.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === item.label ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WCAG Contrast & Shades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrast */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">WCAG Legibility Contrast</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-1" style={{ backgroundColor: hex, color: '#ffffff' }}>
              <span className="font-bold text-sm">White Text</span>
              <span className="block font-mono text-xs">{contrastWhite.toFixed(2)}:1</span>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded font-semibold bg-black/40 text-white">
                {contrastWhite >= 4.5 ? 'WCAG AA Pass' : 'Fail'}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-1" style={{ backgroundColor: hex, color: '#000000' }}>
              <span className="font-bold text-sm">Black Text</span>
              <span className="block font-mono text-xs">{contrastBlack.toFixed(2)}:1</span>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded font-semibold bg-white/60 text-black">
                {contrastBlack >= 4.5 ? 'WCAG AA Pass' : 'Fail'}
              </span>
            </div>
          </div>
        </div>

        {/* Shades Palette */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">10-Step Tone Palette</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 h-20">
            {shades.map((sh, idx) => (
              <div
                key={idx}
                onClick={() => handleCopyValue(`shade-${idx}`, sh)}
                className="rounded-lg cursor-pointer hover:scale-105 transition-transform flex items-end justify-center pb-1 text-[9px] font-mono font-bold text-white shadow-sm"
                style={{ backgroundColor: sh }}
                title={`Click to copy ${sh}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
