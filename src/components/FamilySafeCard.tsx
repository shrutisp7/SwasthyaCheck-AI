import React, { useState } from 'react';
import { ShieldAlert, Volume2, VolumeX, CheckCircle, XCircle, AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';
import type { FactCheckResult, Language, VerdictType } from '../types';
import { getTranslation } from '../data/languages';
import { speakText, stopSpeaking } from '../services/speechService';

interface FamilySafeCardProps {
  result: FactCheckResult;
  selectedLanguage: Language;
}

export const FamilySafeCard: React.FC<FamilySafeCardProps> = ({
  result,
  selectedLanguage,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const effectiveLang = selectedLanguage === 'auto' ? (result.languageDetectedOrSelected as Language || 'en') : selectedLanguage;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speechContent = `${getTranslation(effectiveLang, 'verdictLabel')}: ${result.verdict}. ${getTranslation(effectiveLang, 'whatDoesThisMean')}: ${result.why}. ${getTranslation(effectiveLang, 'whatShouldIDo')}: ${result.safeNextStep}.`;
      setIsPlayingAudio(true);
      speakText(speechContent, effectiveLang, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const getVerdictStyle = (verdict: VerdictType) => {
    switch (verdict) {
      case 'TRUE':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
          badgeBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />,
          label: '✅ ' + (effectiveLang === 'hi' ? 'समर्थित - सही जानकारी' : 'SUPPORTED - TRUE')
        };
      case 'PARTLY_TRUE':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badgeBg: 'bg-amber-500 text-white',
          icon: <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />,
          label: '⚠️ ' + (effectiveLang === 'hi' ? 'अंशतः सही / अधूरा संदर्भ' : 'PARTLY TRUE / MISSING CONTEXT')
        };
      case 'FALSE':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-900',
          badgeBg: 'bg-rose-600 text-white',
          icon: <XCircle className="w-8 h-8 text-rose-600 shrink-0" />,
          label: '❌ ' + (effectiveLang === 'hi' ? 'गलत - झूठा दावा' : 'FALSE')
        };
      case 'DANGEROUS':
        return {
          bg: 'bg-red-100 border-red-400 text-red-950 animate-pulse',
          badgeBg: 'bg-red-700 text-white font-extrabold',
          icon: <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />,
          label: '🚨 ' + (effectiveLang === 'hi' ? 'खतरनाक स्वास्थ्य सलाह' : 'DANGEROUS CLAIM')
        };
      case 'UNVERIFIED':
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-900',
          badgeBg: 'bg-slate-600 text-white',
          icon: <HelpCircle className="w-8 h-8 text-slate-600 shrink-0" />,
          label: '⚠️ ' + (effectiveLang === 'hi' ? 'अपुष्ट जानकारी' : 'UNVERIFIED')
        };
    }
  };

  const vStyle = getVerdictStyle(result.verdict);
  const canForward = result.verdict === 'TRUE';

  return (
    <div className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl my-6 font-sans ${vStyle.bg} transition-all`}>
      {/* Family Safe Header Banner */}
      <div className="flex items-center justify-between mb-6 border-b border-black/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👨‍👩‍👧</span>
          <div>
            <h3 className="text-xl sm:text-2xl font-black m-0 text-slate-900">
              {getTranslation(effectiveLang, 'familySafeMode')}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 m-0">
              Simplified & Easy-to-Read Health Fact-Check
            </p>
          </div>
        </div>

        {/* Read Aloud Button */}
        <button
          onClick={handleToggleAudio}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-sm sm:text-base shadow-md transition-transform active:scale-95 cursor-pointer ${
            isPlayingAudio ? 'bg-amber-500 text-white animate-pulse' : 'bg-teal-700 text-white hover:bg-teal-800'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-6 h-6" />
              <span>{getTranslation(effectiveLang, 'stopReading')}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6" />
              <span>{getTranslation(effectiveLang, 'readThisToMe')}</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: VERDICT */}
      <div className="mb-6 bg-white/90 p-5 rounded-2xl border-2 border-black/10 shadow-sm">
        <div className="text-xs font-black tracking-widest text-slate-500 uppercase mb-2">
          {getTranslation(effectiveLang, 'verdictLabel')}
        </div>
        <div className="flex items-center gap-3">
          {vStyle.icon}
          <span className={`text-xl sm:text-2xl font-black px-4 py-1.5 rounded-xl ${vStyle.badgeBg}`}>
            {vStyle.label}
          </span>
        </div>
        <p className="mt-3 text-base sm:text-lg font-bold text-slate-800 m-0 border-t border-slate-100 pt-2">
          "{result.translatedClaim || result.extractedClaim}"
        </p>
      </div>

      {/* Section 2: WHAT DOES THIS MEAN? */}
      <div className="mb-6 bg-white/90 p-5 rounded-2xl border-2 border-black/10 shadow-sm">
        <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide m-0 mb-2 flex items-center gap-2">
          <span>💡</span> {getTranslation(effectiveLang, 'whatDoesThisMean')}
        </h4>
        <p className="text-base sm:text-xl font-bold leading-relaxed text-slate-900 m-0">
          {result.why}
        </p>
      </div>

      {/* Section 3: WHAT SHOULD I DO? */}
      <div className="mb-6 bg-white/90 p-5 rounded-2xl border-2 border-black/10 shadow-sm">
        <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide m-0 mb-2 flex items-center gap-2">
          <span>🛡️</span> {getTranslation(effectiveLang, 'whatShouldIDo')}
        </h4>
        <p className="text-base sm:text-xl font-extrabold leading-relaxed text-emerald-950 m-0 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
          {result.safeNextStep}
        </p>
      </div>

      {/* Section 4: CAN I FORWARD THIS? */}
      <div className="mb-6 bg-white/90 p-5 rounded-2xl border-2 border-black/10 shadow-sm">
        <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide m-0 mb-2 flex items-center gap-2">
          <span>📲</span> {getTranslation(effectiveLang, 'canIForwardThis')}
        </h4>
        <div className="text-base sm:text-lg font-extrabold">
          {canForward ? (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2">
              {getTranslation(effectiveLang, 'yesForwardWithContext')}
            </div>
          ) : (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-950 rounded-xl flex items-center gap-2">
              {getTranslation(effectiveLang, 'noDoNotForward')}
            </div>
          )}
        </div>
      </div>

      {/* Section 5: TRUSTED SOURCE */}
      {result.trustedSource && (
        <div className="bg-white/90 p-4 rounded-2xl border-2 border-black/10 shadow-sm flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span>🏛️</span>
            <span>{getTranslation(effectiveLang, 'trustedSourceLabel')}:</span>
            <span className="font-extrabold text-teal-800">{result.trustedSource.name}</span>
          </div>
          {result.trustedSource.url && (
            <a
              href={result.trustedSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-700 hover:underline font-bold"
            >
              <span>Verify Official Source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
