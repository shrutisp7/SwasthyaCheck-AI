import React from 'react';
import { ShieldCheck, Globe, Type, History } from 'lucide-react';
import type { Language, FontSizeOption } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/languages';

interface HeaderProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  fontSize: FontSizeOption;
  onChangeFontSize: (size: FontSizeOption) => void;
  onToggleHistory: () => void;
  historyCount: number;
  familySafeMode: boolean;
  onToggleFamilySafeMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onSelectLanguage,
  fontSize,
  onChangeFontSize,
  onToggleHistory,
  historyCount,
  familySafeMode,
  onToggleFamilySafeMode,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-teal-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20 text-white shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0 leading-tight">
                  SwasthyaCheck AI
                </h1>
                <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
                  India Fact-Check
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-teal-700 m-0 italic">
                “{getTranslation(selectedLanguage, 'tagline')}”
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center flex-wrap gap-2 justify-end">
            {/* Family Safe Mode Toggle */}
            <button
              onClick={onToggleFamilySafeMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs ${
                familySafeMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/30 scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-900'
              }`}
              title="Toggle Family Safe Mode for simple, high-readability fact checks"
            >
              <span>👨‍👩‍👧</span>
              <span className="hidden sm:inline">
                {getTranslation(selectedLanguage, 'familySafeMode')}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${familySafeMode ? 'bg-white text-amber-900' : 'bg-slate-200 text-slate-700'}`}>
                {familySafeMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative inline-flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-1.5 shadow-xs hover:border-teal-300 transition-colors">
              <Globe className="w-4 h-4 text-teal-600 mr-2 shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as Language)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Toggle for Accessibility */}
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
              <span className="text-xs text-slate-500 font-medium px-1.5 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-slate-600" />
              </span>
              <button
                onClick={() => onChangeFontSize('normal')}
                className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                  fontSize === 'normal'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => onChangeFontSize('large')}
                className={`px-2 py-1 text-sm rounded-lg font-bold transition-all ${
                  fontSize === 'large'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => onChangeFontSize('xlarge')}
                className={`px-2.5 py-1 text-base rounded-lg font-extrabold transition-all ${
                  fontSize === 'xlarge'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Extra Large Font Size"
              >
                A++
              </button>
            </div>

            {/* History Toggle */}
            <button
              onClick={onToggleHistory}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Previous Checks"
            >
              <History className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="bg-teal-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Subtitle Welcome Banner */}
        <div className="mt-3 p-3 bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-teal-50/80 rounded-2xl border border-teal-100/80 text-slate-700 text-xs sm:text-sm flex items-start gap-2.5">
          <span className="text-base shrink-0">💡</span>
          <p className="m-0 font-medium leading-relaxed">
            {getTranslation(selectedLanguage, 'subtitle')}
          </p>
        </div>
      </div>
    </header>
  );
};
