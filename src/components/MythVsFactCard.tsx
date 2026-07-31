import React, { useState } from 'react';
import { Copy, Check, Share2, ShieldCheck, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import type { FactCheckResult, Language, VerdictType } from '../types';
import { getTranslation } from '../data/languages';

interface MythVsFactCardProps {
  result: FactCheckResult;
  selectedLanguage: Language;
}

export const MythVsFactCard: React.FC<MythVsFactCardProps> = ({
  result,
  selectedLanguage,
}) => {
  const [copied, setCopied] = useState(false);
  const effectiveLang = selectedLanguage === 'auto' ? (result.languageDetectedOrSelected as Language || 'en') : selectedLanguage;

  const getCardHeaders = (verdict: VerdictType) => {
    switch (verdict) {
      case 'FALSE':
        return {
          leftTitle: '❌ ' + getTranslation(effectiveLang, 'mythLabel'),
          rightTitle: '✅ ' + getTranslation(effectiveLang, 'factLabel'),
          leftBg: 'bg-rose-50 border-rose-200 text-rose-950',
          rightBg: 'bg-emerald-50 border-emerald-200 text-emerald-950'
        };
      case 'DANGEROUS':
        return {
          leftTitle: '🚨 ' + getTranslation(effectiveLang, 'dangerousClaimLabel'),
          rightTitle: '✅ ' + getTranslation(effectiveLang, 'saferFactLabel'),
          leftBg: 'bg-red-100 border-red-300 text-red-950',
          rightBg: 'bg-emerald-50 border-emerald-300 text-emerald-950'
        };
      case 'TRUE':
        return {
          leftTitle: '📄 ' + getTranslation(effectiveLang, 'claimLabel'),
          rightTitle: '✅ ' + getTranslation(effectiveLang, 'evidenceSaysLabel'),
          leftBg: 'bg-slate-50 border-slate-200 text-slate-900',
          rightBg: 'bg-emerald-50 border-emerald-200 text-emerald-950'
        };
      case 'PARTLY_TRUE':
        return {
          leftTitle: '⚠️ ' + getTranslation(effectiveLang, 'claimLabel'),
          rightTitle: '✅ ' + getTranslation(effectiveLang, 'fullContextLabel'),
          leftBg: 'bg-amber-50 border-amber-200 text-amber-950',
          rightBg: 'bg-teal-50 border-teal-200 text-teal-950'
        };
      case 'UNVERIFIED':
      default:
        return {
          leftTitle: '❓ ' + getTranslation(effectiveLang, 'claimLabel'),
          rightTitle: '⚪ ' + getTranslation(effectiveLang, 'whatWeKnowLabel'),
          leftBg: 'bg-slate-50 border-slate-200 text-slate-900',
          rightBg: 'bg-slate-100 border-slate-300 text-slate-900'
        };
    }
  };

  const headers = getCardHeaders(result.verdict);

  const formattedCardText = `*SwasthyaCheck AI — ${getTranslation(effectiveLang, 'mythVsFactTitle')}*\n\n${headers.leftTitle}:\n"${result.translatedClaim || result.extractedClaim}"\n\n${headers.rightTitle}:\n${result.why}\n\n*Source:* ${result.trustedSource.name}\n\nVerified by SwasthyaCheck AI`;

  const handleCopyCard = () => {
    navigator.clipboard.writeText(formattedCardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SwasthyaCheck Myth vs Fact',
          text: formattedCardText,
          url: window.location.href,
        });
      } catch (err) {
        handleCopyCard();
      }
    } else {
      handleCopyCard();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl my-6 border border-teal-500/30 relative overflow-hidden">
      {/* Background Accent Pill */}
      <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-500/20 pb-4 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold m-0 text-white tracking-tight">
              {getTranslation(effectiveLang, 'mythVsFactTitle')}
            </h3>
            <p className="text-xs text-teal-300/80 m-0 font-medium">
              Verified Evidence Summary Card
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCard}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl border border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-300" />}
            <span>{copied ? getTranslation(effectiveLang, 'cardCopied') : getTranslation(effectiveLang, 'copyCardText')}</span>
          </button>

          <button
            onClick={handleShareCard}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer shadow-md shadow-teal-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span>{getTranslation(effectiveLang, 'shareCard')}</span>
          </button>
        </div>
      </div>

      {/* Visual Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left Box: Claim / Myth */}
        <div className={`p-5 rounded-2xl border ${headers.leftBg} shadow-inner`}>
          <span className="text-xs font-black uppercase tracking-wider block mb-2 opacity-90">
            {headers.leftTitle}
          </span>
          <p className="text-base sm:text-lg font-bold leading-snug m-0">
            "{result.translatedClaim || result.extractedClaim}"
          </p>
        </div>

        {/* Right Box: Fact / Evidence */}
        <div className={`p-5 rounded-2xl border ${headers.rightBg} shadow-inner`}>
          <span className="text-xs font-black uppercase tracking-wider block mb-2 opacity-90">
            {headers.rightTitle}
          </span>
          <p className="text-sm sm:text-base font-semibold leading-relaxed m-0">
            {result.why}
          </p>
        </div>
      </div>

      {/* Footer & Source */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-teal-200/90 pt-3 border-t border-teal-500/20 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Source: <strong className="text-white">{result.trustedSource.name}</strong></span>
        </div>
        {result.trustedSource.url && (
          <a
            href={result.trustedSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-300 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
