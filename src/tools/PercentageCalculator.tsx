import React, { useState } from 'react';
import { Calculator, Percent, ArrowRight, HelpCircle, Users, DollarSign } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

export default function PercentageCalculator() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'mode1' | 'mode2' | 'mode3' | 'mode4' | 'mode5'>('mode1');

  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState('15');
  const [m1Y, setM1Y] = useState('250');
  const m1Result = ((parseFloat(m1X) || 0) * (parseFloat(m1Y) || 0)) / 100;

  // Mode 2: X is what % of Y?
  const [m2X, setM2X] = useState('45');
  const [m2Y, setM2Y] = useState('300');
  const m2Result = (parseFloat(m2Y) || 0) !== 0 ? ((parseFloat(m2X) || 0) / (parseFloat(m2Y) || 1)) * 100 : 0;

  // Mode 3: % Increase/Decrease from X to Y
  const [m3X, setM3X] = useState('100');
  const [m3Y, setM3Y] = useState('125');
  const m3Diff = (parseFloat(m3Y) || 0) - (parseFloat(m3X) || 0);
  const m3Result = (parseFloat(m3X) || 0) !== 0 ? (m3Diff / (parseFloat(m3X) || 1)) * 100 : 0;

  // Mode 4: Value after X% change on Y
  const [m4Percent, setM4Percent] = useState('20');
  const [m4Value, setM4Value] = useState('80');
  const [m4Type, setM4Type] = useState<'increase' | 'decrease'>('increase');
  const m4Factor = m4Type === 'increase' ? 1 + (parseFloat(m4Percent) || 0) / 100 : 1 - (parseFloat(m4Percent) || 0) / 100;
  const m4Result = (parseFloat(m4Value) || 0) * m4Factor;

  // Mode 5: Tip & Split Bill
  const [m5Bill, setM5Bill] = useState('120');
  const [m5TipPercent, setM5TipPercent] = useState('18');
  const [m5People, setM5People] = useState('3');
  const tipTotal = ((parseFloat(m5Bill) || 0) * (parseFloat(m5TipPercent) || 0)) / 100;
  const totalBillWithTip = (parseFloat(m5Bill) || 0) + tipTotal;
  const perPerson = (parseInt(m5People) || 1) > 0 ? totalBillWithTip / parseInt(m5People) : totalBillWithTip;

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'mode1', label: t('pct.tab1', 'X% of Y') },
          { id: 'mode2', label: t('pct.tab2', 'X is what % of Y') },
          { id: 'mode3', label: t('pct.tab3', '% Change (Inc/Dec)') },
          { id: 'mode4', label: t('pct.tab4', 'Value +/- %') },
          { id: 'mode5', label: t('pct.tab5', 'Tip & Bill Split') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mode 1 */}
      {activeTab === 'mode1' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('pct.mode1Title', 'What is X% of Y?')}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{t('pct.whatIs', 'What is')}</span>
            <div className="relative w-28">
              <input
                type="number"
                value={m1X}
                onChange={(e) => setM1X(e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pr-7 text-neutral-900 dark:text-white"
              />
              <span className="absolute right-2.5 top-2.5 text-neutral-400 font-bold">%</span>
            </div>
            <span>{t('pct.of', 'of')}</span>
            <input
              type="number"
              value={m1Y}
              onChange={(e) => setM1Y(e.target.value)}
              className="w-32 px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            <div className="px-5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-mono font-bold text-lg">
              {m1Result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">{t('pct.formula', 'Formula & Step-by-Step:')}</p>
            <p className="font-mono">{`Result = (${m1X} ÷ 100) × ${m1Y} = ${m1Result}`}</p>
          </div>
        </div>
      )}

      {/* Mode 2 */}
      {activeTab === 'mode2' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('pct.mode2Title', 'X is what percentage of Y?')}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <input
              type="number"
              value={m2X}
              onChange={(e) => setM2X(e.target.value)}
              className="w-28 px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <span>{t('pct.isWhatPctOf', 'is what % of')}</span>
            <input
              type="number"
              value={m2Y}
              onChange={(e) => setM2Y(e.target.value)}
              className="w-32 px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            <div className="px-5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-mono font-bold text-lg">
              {m2Result.toFixed(2)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">{t('pct.formula', 'Formula & Step-by-Step:')}</p>
            <p className="font-mono">{`Result = (${m2X} ÷ ${m2Y}) × 100 = ${m2Result.toFixed(2)}%`}</p>
          </div>
        </div>
      )}

      {/* Mode 3 */}
      {activeTab === 'mode3' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('pct.mode3Title', 'Percentage Increase / Decrease')}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{t('pct.from', 'From')}</span>
            <input
              type="number"
              value={m3X}
              onChange={(e) => setM3X(e.target.value)}
              className="w-28 px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <span>{t('pct.to', 'to')}</span>
            <input
              type="number"
              value={m3Y}
              onChange={(e) => setM3Y(e.target.value)}
              className="w-28 px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            <div
              className={`px-5 py-2 rounded-xl font-mono font-bold text-lg border ${
                m3Result >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
              }`}
            >
              {m3Result >= 0 ? `+${m3Result.toFixed(2)}% (${t('pct.increase', 'Increase')})` : `${m3Result.toFixed(2)}% (${t('pct.decrease', 'Decrease')})`}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">{t('pct.formula', 'Formula & Step-by-Step:')}</p>
            <p className="font-mono">{`Difference = ${m3Y} - ${m3X} = ${m3Diff}`}</p>
            <p className="font-mono">{`Percentage Change = (${m3Diff} ÷ ${m3X}) × 100 = ${m3Result.toFixed(2)}%`}</p>
          </div>
        </div>
      )}

      {/* Mode 4 */}
      {activeTab === 'mode4' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('pct.mode4Title', 'Calculate Value After Percentage Change')}</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{t('pct.originalValue', 'Original Value')}</span>
            <input
              type="number"
              value={m4Value}
              onChange={(e) => setM4Value(e.target.value)}
              className="w-28 px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
            />
            <select
              value={m4Type}
              onChange={(e) => setM4Type(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-medium"
            >
              <option value="increase">{t('pct.increasedBy', 'Increased by (+)')}</option>
              <option value="decrease">{t('pct.decreasedBy', 'Decreased by (-)')}</option>
            </select>
            <div className="relative w-28">
              <input
                type="number"
                value={m4Percent}
                onChange={(e) => setM4Percent(e.target.value)}
                className="w-full px-3 py-2 font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pr-7 text-neutral-900 dark:text-white"
              />
              <span className="absolute right-2.5 top-2.5 text-neutral-400 font-bold">%</span>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            <div className="px-5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-mono font-bold text-lg">
              {m4Result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 5: Tip Calculator */}
      {activeTab === 'mode5' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('pct.mode5Title', 'Tip & Bill Splitter')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-neutral-500 mb-1">{t('pct.billTotal', 'Bill Total ($)')}</label>
              <input
                type="number"
                value={m5Bill}
                onChange={(e) => setM5Bill(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">{t('pct.tipPercent', 'Tip Percentage (%)')}</label>
              <input
                type="number"
                value={m5TipPercent}
                onChange={(e) => setM5TipPercent(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">{t('pct.numPeople', 'Number of People')}</label>
              <input
                type="number"
                min="1"
                value={m5People}
                onChange={(e) => setM5People(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 text-center">
              <span className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">{t('pct.tipAmount', 'Tip Amount')}</span>
              <span className="text-lg font-bold font-mono text-emerald-600">${tipTotal.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 text-center">
              <span className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">{t('pct.totalWithTip', 'Total with Tip')}</span>
              <span className="text-lg font-bold font-mono text-blue-600">${totalBillWithTip.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-center">
              <span className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">{t('pct.perPerson', 'Amount Per Person')}</span>
              <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">${perPerson.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
