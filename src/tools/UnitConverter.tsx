import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Layers } from 'lucide-react';
import { copyToClipboard, triggerConfetti } from '../lib/utils';
import { useTranslation } from '../i18n/i18nContext';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'digital' | 'speed' | 'time';

interface UnitDef {
  id: string;
  name: string;
  ratio: number; // Ratio relative to base unit
}

const unitData: Record<UnitCategory, { name: string; base: string; units: UnitDef[] }> = {
  length: {
    name: 'Length & Distance',
    base: 'm',
    units: [
      { id: 'km', name: 'Kilometers (km)', ratio: 1000 },
      { id: 'm', name: 'Meters (m)', ratio: 1 },
      { id: 'cm', name: 'Centimeters (cm)', ratio: 0.01 },
      { id: 'mm', name: 'Millimeters (mm)', ratio: 0.001 },
      { id: 'mi', name: 'Miles (mi)', ratio: 1609.344 },
      { id: 'yd', name: 'Yards (yd)', ratio: 0.9144 },
      { id: 'ft', name: 'Feet (ft)', ratio: 0.3048 },
      { id: 'in', name: 'Inches (in)', ratio: 0.0254 },
    ],
  },
  weight: {
    name: 'Weight & Mass',
    base: 'kg',
    units: [
      { id: 't', name: 'Metric Tons (t)', ratio: 1000 },
      { id: 'kg', name: 'Kilograms (kg)', ratio: 1 },
      { id: 'g', name: 'Grams (g)', ratio: 0.001 },
      { id: 'mg', name: 'Milligrams (mg)', ratio: 0.000001 },
      { id: 'lb', name: 'Pounds (lbs)', ratio: 0.45359237 },
      { id: 'oz', name: 'Ounces (oz)', ratio: 0.028349523 },
    ],
  },
  temperature: {
    name: 'Temperature',
    base: 'c',
    units: [
      { id: 'c', name: 'Celsius (°C)', ratio: 1 },
      { id: 'f', name: 'Fahrenheit (°F)', ratio: 1 },
      { id: 'k', name: 'Kelvin (K)', ratio: 1 },
    ],
  },
  area: {
    name: 'Area',
    base: 'sqm',
    units: [
      { id: 'sqkm', name: 'Square Kilometers (km²)', ratio: 1000000 },
      { id: 'sqm', name: 'Square Meters (m²)', ratio: 1 },
      { id: 'sqft', name: 'Square Feet (ft²)', ratio: 0.09290304 },
      { id: 'sqin', name: 'Square Inches (in²)', ratio: 0.00064516 },
      { id: 'acre', name: 'Acres', ratio: 4046.8564224 },
      { id: 'ha', name: 'Hectares (ha)', ratio: 10000 },
    ],
  },
  volume: {
    name: 'Volume',
    base: 'l',
    units: [
      { id: 'l', name: 'Liters (L)', ratio: 1 },
      { id: 'ml', name: 'Milliliters (mL)', ratio: 0.001 },
      { id: 'gal', name: 'US Gallons (gal)', ratio: 3.78541 },
      { id: 'qt', name: 'US Quarts (qt)', ratio: 0.946353 },
      { id: 'pt', name: 'US Pints (pt)', ratio: 0.473176 },
      { id: 'cup', name: 'US Cups', ratio: 0.24 },
    ],
  },
  digital: {
    name: 'Digital Storage',
    base: 'b',
    units: [
      { id: 'b', name: 'Bytes (B)', ratio: 1 },
      { id: 'kb', name: 'Kilobytes (KB)', ratio: 1024 },
      { id: 'mb', name: 'Megabytes (MB)', ratio: 1048576 },
      { id: 'gb', name: 'Gigabytes (GB)', ratio: 1073741824 },
      { id: 'tb', name: 'Terabytes (TB)', ratio: 1099511627776 },
    ],
  },
  speed: {
    name: 'Speed',
    base: 'mps',
    units: [
      { id: 'mps', name: 'Meters / second (m/s)', ratio: 1 },
      { id: 'kmh', name: 'Kilometers / hour (km/h)', ratio: 0.277778 },
      { id: 'mph', name: 'Miles / hour (mph)', ratio: 0.44704 },
      { id: 'knot', name: 'Knots (kn)', ratio: 0.514444 },
    ],
  },
  time: {
    name: 'Time',
    base: 'sec',
    units: [
      { id: 'sec', name: 'Seconds (s)', ratio: 1 },
      { id: 'min', name: 'Minutes (min)', ratio: 60 },
      { id: 'hr', name: 'Hours (h)', ratio: 3600 },
      { id: 'day', name: 'Days', ratio: 86400 },
      { id: 'week', name: 'Weeks', ratio: 604800 },
      { id: 'year', name: 'Years (365 days)', ratio: 31536000 },
    ],
  },
};

export default function UnitConverter() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState(10);
  const [copied, setCopied] = useState(false);

  const currentCat = unitData[category];

  // Temperature special conversion logic
  const convertTemp = (val: number, from: string, to: string): number => {
    let celsius = val;
    if (from === 'f') celsius = (val - 32) * (5 / 9);
    else if (from === 'k') celsius = val - 273.15;

    if (to === 'f') return celsius * (9 / 5) + 32;
    if (to === 'k') return celsius + 273.15;
    return celsius;
  };

  const convertValue = (val: number, from: string, to: string): number => {
    if (category === 'temperature') return convertTemp(val, from, to);
    const uFrom = currentCat.units.find((u) => u.id === from);
    const uTo = currentCat.units.find((u) => u.id === to);
    if (!uFrom || !uTo) return 0;
    const baseVal = val * uFrom.ratio;
    return baseVal / uTo.ratio;
  };

  const result = convertValue(value, fromUnit, toUnit);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const catObj = unitData[newCat];
    setFromUnit(catObj.units[0].id);
    setToUnit(catObj.units[1] ? catObj.units[1].id : catObj.units[0].id);
  };

  const handleCopy = () => {
    copyToClipboard(`${result.toLocaleString(undefined, { maximumFractionDigits: 6 })}`);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {Object.entries(unitData).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key as UnitCategory)}
            className={`px-3 py-2 text-xs font-medium rounded-xl transition-all ${
              category === key
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Conversion Block */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
          {/* From Input */}
          <div className="sm:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase">{t('unit.fromValue', 'From Value & Unit')}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 text-lg font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-medium"
            >
              {currentCat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex justify-center pt-4">
            <button
              onClick={swapUnits}
              className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors shadow-sm"
              title={t('unit.swap', 'Swap From and To units')}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* To Output */}
          <div className="sm:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase">{t('unit.toResult', 'To Result')}</label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                className="w-full px-4 py-3 text-lg font-mono font-bold rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 pr-12"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                title={t('action.copy', 'Copy Result')}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-medium"
            >
              {currentCat.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conversion Matrix Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {t('unit.matrix', 'Full Conversion Matrix')} ({value} {fromUnit})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {currentCat.units.map((u) => {
            const valInUnit = convertValue(value, fromUnit, u.id);
            return (
              <div
                key={u.id}
                onClick={() => {
                  copyToClipboard(valInUnit.toString());
                  triggerConfetti();
                }}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 flex justify-between items-center cursor-pointer hover:border-blue-500/50 transition-colors"
                title={t('action.clickToCopy', 'Click to copy')}
              >
                <span className="text-neutral-500 truncate mr-2">{u.name.split(' (')[0]}</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {valInUnit.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
