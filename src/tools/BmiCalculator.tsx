import React, { useState } from 'react';
import { Activity, Flame, Heart, Info, User } from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';

export default function BmiCalculator() {
  const { t } = useTranslation();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(30);

  // Metric inputs
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);

  // Imperial inputs
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [weightLbs, setWeightLbs] = useState(154);

  // Compute BMI
  let heightMeters = 1.75;
  let weightKgValue = 70;

  if (unitSystem === 'metric') {
    heightMeters = (heightCm || 1) / 100;
    weightKgValue = weightKg || 1;
  } else {
    const totalInches = (heightFt || 0) * 12 + (heightIn || 0);
    heightMeters = totalInches * 0.0254;
    weightKgValue = (weightLbs || 1) * 0.453592;
  }

  const bmi = heightMeters > 0 ? weightKgValue / (heightMeters * heightMeters) : 0;

  // Healthy weight range (BMI 18.5 - 24.9)
  const minHealthyKg = 18.5 * (heightMeters * heightMeters);
  const maxHealthyKg = 24.9 * (heightMeters * heightMeters);

  const formatWeight = (kgVal: number) => {
    if (unitSystem === 'metric') return `${kgVal.toFixed(1)} kg`;
    return `${(kgVal * 2.20462).toFixed(1)} lbs`;
  };

  // BMR estimate (Mifflin-St Jeor Equation)
  let bmr = 10 * weightKgValue + 6.25 * (heightMeters * 100) - 5 * age;
  if (gender === 'male') bmr += 5;
  else bmr -= 161;

  const tdee = bmr * 1.375; // Moderate active factor

  const getBmiCategory = () => {
    if (bmi < 18.5) return { category: t('bmi.underweight', 'Underweight'), color: 'text-amber-500', bg: 'bg-amber-500', barPos: '15%' };
    if (bmi < 25.0) return { category: t('bmi.normal', 'Normal / Healthy Weight'), color: 'text-emerald-500', bg: 'bg-emerald-500', barPos: '45%' };
    if (bmi < 30.0) return { category: t('bmi.overweight', 'Overweight'), color: 'text-orange-500', bg: 'bg-orange-500', barPos: '72%' };
    return { category: t('bmi.obese', 'Obese'), color: 'text-rose-500', bg: 'bg-rose-500', barPos: '90%' };
  };

  const bmiCat = getBmiCategory();

  return (
    <div className="space-y-8">
      {/* Unit Toggle & Primary Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              {t('bmi.bodyParams', 'Body Parameters')}
            </h3>
            <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl text-xs">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  unitSystem === 'metric' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500'
                }`}
              >
                {t('bmi.metric', 'Metric (cm, kg)')}
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  unitSystem === 'imperial' ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500'
                }`}
              >
                {t('bmi.imperial', 'Imperial (ft, lbs)')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-500 mb-1">{t('bmi.gender', 'Biological Gender')}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              >
                <option value="male">{t('bmi.male', 'Male')}</option>
                <option value="female">{t('bmi.female', 'Female')}</option>
              </select>
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">{t('bmi.age', 'Age (Years)')}</label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {unitSystem === 'metric' ? (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-neutral-500">{t('bmi.heightCm', 'Height (cm)')}</label>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-neutral-500">{t('bmi.weightKg', 'Weight (kg)')}</label>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 mb-1">{t('bmi.heightFt', 'Height (Feet)')}</label>
                  <input
                    type="number"
                    min="3"
                    max="7"
                    value={heightFt}
                    onChange={(e) => setHeightFt(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{t('bmi.heightIn', 'Height (Inches)')}</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-500 mb-1">{t('bmi.weightLbs', 'Weight (Pounds / lbs)')}</label>
                <input
                  type="number"
                  min="60"
                  max="400"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(parseInt(e.target.value) || 150)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* BMI Results & Gauge */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-neutral-500 uppercase">{t('bmi.yourResult', 'Your BMI Result')}</span>
              <span className={`text-xs font-bold ${bmiCat.color} px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800`}>
                {bmiCat.category}
              </span>
            </div>

            <div className="text-center my-4">
              <span className="text-5xl font-black font-mono text-neutral-900 dark:text-white">{bmi.toFixed(1)}</span>
              <span className="block text-xs text-neutral-400 mt-1">kg/m²</span>
            </div>

            {/* Scale Meter */}
            <div className="space-y-1.5 mt-6">
              <div className="relative h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
                <div className="w-[18.5%] bg-amber-400" title={t('bmi.underweight', 'Underweight')} />
                <div className="w-[25%] bg-emerald-500" title={t('bmi.normal', 'Normal')} />
                <div className="w-[20%] bg-orange-400" title={t('bmi.overweight', 'Overweight')} />
                <div className="w-[36.5%] bg-rose-500" title={t('bmi.obese', 'Obese')} />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>15.0</span>
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
                <span>40.0</span>
              </div>
            </div>
          </div>

          {/* Health Insights */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950">
              <span className="block text-neutral-500 text-[10px] font-semibold uppercase mb-0.5">{t('bmi.idealWeight', 'Ideal Weight Range')}</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                {formatWeight(minHealthyKg)} - {formatWeight(maxHealthyKg)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950">
              <span className="block text-neutral-500 text-[10px] font-semibold uppercase mb-0.5">{t('bmi.tdee', 'Est. Daily Calorie Need (TDEE)')}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{Math.round(tdee)} kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
