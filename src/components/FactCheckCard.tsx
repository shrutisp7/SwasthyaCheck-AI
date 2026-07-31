import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Info,
  Star,
  Bookmark
} from 'lucide-react';
import type { FactCheckResult, Language, VerdictType } from '../types';
import { getTranslation } from '../data/languages';
import { speakText, stopSpeaking } from '../services/speechService';
import { FamilySafeCard } from './FamilySafeCard';
import { MythVsFactCard } from './MythVsFactCard';

interface FactCheckCardProps {
  result: FactCheckResult;
  selectedLanguage: Language;
  familySafeMode?: boolean;
  onSaveCheck?: (result: FactCheckResult) => void;
  isSaved?: boolean;
}

export const FactCheckCard: React.FC<FactCheckCardProps> = ({
  result,
  selectedLanguage,
  familySafeMode = false,
  onSaveCheck,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const effectiveLang = selectedLanguage === 'auto' ? (result.languageDetectedOrSelected as Language || 'en') : selectedLanguage;

  const handleCopySummary = () => {
    const textToCopy = `*SwasthyaCheck AI Fact-Check Result*\n\n*VERDICT:* ${result.verdict}\n*CLAIM:* "${result.translatedClaim || result.extractedClaim}"\n\n*WHY:* ${result.why}\n\n*SAFE NEXT STEP:* ${result.safeNextStep}\n\n*SOURCE:* ${result.trustedSource.name}\n\n*SHOULD I FORWARD THIS?*\n${result.shouldIForward.badgeText}\n\nVerified via SwasthyaCheck AI: Know the Truth.`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speechContent = `${getTranslation(effectiveLang, 'verdictLabel')}: ${result.verdict}. ${getTranslation(effectiveLang, 'claimLabel')}: ${result.translatedClaim || result.extractedClaim}. ${getTranslation(effectiveLang, 'whyLabel')}: ${result.why}. ${getTranslation(effectiveLang, 'safeNextStepLabel')}: ${result.safeNextStep}.`;
      setIsPlayingAudio(true);
      speakText(speechContent, effectiveLang, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Localized Sub-Labels Helper
  const getSubLabel = (key: string, lang: Language) => {
    const subDict: Record<string, Record<string, string>> = {
      trueSub: {
        en: 'The central claim is supported by reliable evidence.',
        hi: 'केंद्रीय दावा विश्वसनीय चिकित्सा साक्ष्यों द्वारा समर्थित है।',
        kn: 'ದಾವೆಯು ವಿಶ್ವಾಸಾರ್ಹ ಸಾಕ್ಷ್ಯಗಳಿಂದ ಬೆಂಬಲಿತವಾಗಿದೆ.',
        ta: 'செய்தி நம்பகமான ஆதாரங்களால் ஆதரிக்கப்படுகிறது.',
        te: 'దావా విశ్వసనీయ ఆధారాలతో మద్దతు పొందింది.'
      },
      partlySub: {
        en: 'Missing important context, exaggerates evidence, or combines true/false info.',
        hi: 'महत्वपूर्ण संदर्भ गायब है, साक्ष्यों को बढ़ा-चढ़ाकर पेश किया गया है, या सही/गलत जानकारी मिश्रित है।',
        kn: 'ಪ್ರಮುಖ ಸಂದರ್ಭದ ಕೊರತೆಯಿದೆ ಅಥವಾ ಮಾಹಿತಿಯನ್ನು ಉತ್ಪ್ರೇಕ್ಷಿಸಲಾಗಿದೆ.',
        ta: 'முக்கிய சூழல் விடுபட்டுள்ளது அல்லது தகவல் மிகைப்படுத்தப்பட்டுள்ளது.',
        te: 'ముఖ్యమైన సందర్భం లేదు లేదా సమాచారం అతిశయోక్తి చేయబడింది.'
      },
      falseSub: {
        en: 'Reliable evidence contradicts the central claim.',
        hi: 'विश्वसनीय चिकित्सा साक्ष्य केंद्रीय दावे का खंडन करते हैं।',
        kn: 'ವಿಶ್ವಾಸಾರ್ಹ ಸಾಕ್ಷ್ಯಗಳು ಈ ದಾವೆಯನ್ನು ನಿರಾಕರಿಸುತ್ತವೆ.',
        ta: 'நம்பகமான ஆதாரங்கள் இச்செய்தியை மறுக்கின்றன.',
        te: 'ವಿಶ್ವಸನಿಯ ಆಧಾರಗಳು ಈ దావాను నిరాకరిస్తాయి.'
      },
      dangerousSub: {
        en: 'The claim could reasonably cause harm or lead to dangerous health decisions.',
        hi: 'यह दावा नुकसान पहुंचा सकता है या खतरनाक स्वास्थ्य निर्णयों का कारण बन सकता है।',
        kn: 'ಈ ದಾವೆಯು ಆರೋಗ್ಯಕ್ಕೆ ತೀವ್ರ ಅಪಾಯವನ್ನುಂಟುಮಾಡಬಹುದು.',
        ta: 'இச்செய்தி சுகாதாரத்திற்கு ஆபத்தை விளைவிக்கக்கூடும்.',
        te: 'ఈ దావా ఆరోగ్యానికి తీవ్ర ప్రమాదాన్ని కలిగించవచ్చు.'
      },
      unverifiedSub: {
        en: 'Not enough reliable information available to verify this claim.',
        hi: 'इस दावे की पुष्टि के लिए पर्याप्त विश्वसनीय जानकारी उपलब्ध नहीं है।',
        kn: 'ಈ ದಾವೆಯನ್ನು ದೃಢೀಕರಿಸಲು ಸಾಕಷ್ಟ ಸಾಕ್ಷ್ಯಗಳಿಲ್ಲ.',
        ta: 'இச்செய்தியை உறுதிப்படுத்த போதுமான ஆதாரங்கள் இல்லை.',
        te: 'ఈ దావాను ధృవీకరించడానికి తగినంత సమాచారం లేదు.'
      },
      authorityLabel: {
        en: 'Authority: Recognized Health Agency',
        hi: 'प्राधिकरण: मान्यता प्राप्त स्वास्थ्य संस्था',
        kn: 'ಪ್ರಾಧಿಕಾರ: ಅಧಿಕೃತ ಆರೋಗ್ಯ ಸಂಸ್ಥೆ',
        ta: 'அதிகாரம்: அங்கீகரிக்கப்பட்ட சுகாதார அமைப்பு',
        te: 'ಅಧಿಕಾರಂ: గుర్తింపు పొందిన ఆరోగ్య సంస్థ'
      },
      footerNotice: {
        en: 'Spread facts, not fear. Share verified summary to WhatsApp groups.',
        hi: 'तथ्य फैलाएं, डर नहीं। व्हाट्सएप ग्रुप में सत्यापित सारांश शेयर करें।',
        kn: 'ಸತ್ಯವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ, ಭಯವನ್ನಲ್ಲ.',
        ta: 'உண்மையைப் பரப்புங்கள், பயத்தை அல்ல.',
        te: 'నిజాలను ప్రచారం చేయండి, భయాన్ని కాదు.'
      },
      origClaimLabel: {
        en: 'Original Submitted Claim:',
        hi: 'मूल सबमिट किया गया दावा:',
        kn: 'ಮೂಲ ಸಂದೇಶ:',
        ta: 'மூல செய்தி:',
        te: 'మూల సందేశం:'
      }
    };
    return subDict[key]?.[lang] || subDict[key]?.['en'] || '';
  };

  // Verdict Styling & Badges Configuration
  const getVerdictBadge = (verdict: VerdictType) => {
    switch (verdict) {
      case 'TRUE':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          badgeBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />,
          title: 'TRUE / SUPPORTED',
          desc: getSubLabel('trueSub', effectiveLang)
        };
      case 'PARTLY_TRUE':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          badgeBg: 'bg-amber-500 text-white',
          icon: <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />,
          title: 'PARTLY TRUE / MISSING CONTEXT',
          desc: getSubLabel('partlySub', effectiveLang)
        };
      case 'FALSE':
        return {
          bg: 'bg-rose-50 text-rose-950 border-rose-300',
          badgeBg: 'bg-rose-600 text-white',
          icon: <XCircle className="w-7 h-7 text-rose-600 shrink-0" />,
          title: 'FALSE CLAIM',
          desc: getSubLabel('falseSub', effectiveLang)
        };
      case 'DANGEROUS':
        return {
          bg: 'bg-red-100 text-red-950 border-red-400 animate-pulse',
          badgeBg: 'bg-red-700 text-white font-extrabold',
          icon: <ShieldAlert className="w-7 h-7 text-red-600 shrink-0" />,
          title: 'DANGEROUS MISINFORMATION',
          desc: getSubLabel('dangerousSub', effectiveLang)
        };
      case 'UNVERIFIED':
      default:
        return {
          bg: 'bg-slate-100 text-slate-900 border-slate-300',
          badgeBg: 'bg-slate-600 text-white',
          icon: <HelpCircle className="w-7 h-7 text-slate-600 shrink-0" />,
          title: 'UNVERIFIED CLAIM',
          desc: getSubLabel('unverifiedSub', effectiveLang)
        };
    }
  };

  const vBadge = getVerdictBadge(result.verdict);

  return (
    <div className="space-y-6">
      {/* 1. FAMILY SAFE MODE VIEW vs STANDARD VIEW */}
      {familySafeMode ? (
        <FamilySafeCard result={result} selectedLanguage={selectedLanguage} />
      ) : (
        <div className={`p-6 sm:p-8 rounded-3xl border-2 shadow-xl bg-white ${vBadge.bg} transition-all relative overflow-hidden`}>
          {/* Emergency Alert Banner */}
          {result.isEmergency && result.emergencyAlertText && (
            <div className="mb-6 p-4 bg-red-600 text-white rounded-2xl font-black text-sm sm:text-base flex items-center gap-3 shadow-lg animate-bounce">
              <ShieldAlert className="w-8 h-8 text-yellow-300 shrink-0" />
              <div>{result.emergencyAlertText}</div>
            </div>
          )}

          {/* Header Card Controls */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                {getTranslation(effectiveLang, 'verdictLabel')}
              </span>
              <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${vBadge.badgeBg}`}>
                {result.verdict}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark Button */}
              {onSaveCheck && (
                <button
                  onClick={() => onSaveCheck(result)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={isSaved ? getTranslation(effectiveLang, 'removeSaved') : getTranslation(effectiveLang, 'saveCheck')}
                >
                  <Star className={`w-4 h-4 ${isSaved ? 'text-amber-600 fill-amber-500' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">{isSaved ? getTranslation(effectiveLang, 'checkSaved') : getTranslation(effectiveLang, 'saveCheck')}</span>
                </button>
              )}

              {/* Read Aloud Button */}
              <button
                onClick={handleToggleAudio}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
                <span>{isPlayingAudio ? getTranslation(effectiveLang, 'stopAudio') : getTranslation(effectiveLang, 'listenAudio')}</span>
              </button>
            </div>
          </div>

          {/* Verdict Overview Banner */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-slate-200/80 mb-6 shadow-xs">
            {vBadge.icon}
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold m-0 text-slate-900 leading-snug">
                {vBadge.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 m-0 font-medium leading-relaxed">
                {vBadge.desc}
              </p>
            </div>
          </div>

          {/* Extracted Claim Text */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
              {getTranslation(effectiveLang, 'claimLabel')}
            </span>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 m-0 leading-snug">
              "{result.translatedClaim || result.extractedClaim}"
            </p>
            {result.translatedClaim && result.rawInputText !== result.translatedClaim && (
              <p className="text-xs text-slate-500 mt-2 m-0 font-medium italic border-t border-slate-200/60 pt-1.5">
                {getSubLabel('origClaimLabel', effectiveLang)} "{result.rawInputText}"
              </p>
            )}
          </div>

          {/* Detailed 4 Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* WHY? */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-black tracking-wider text-teal-800 uppercase block mb-1">
                🔍 {getTranslation(effectiveLang, 'whyLabel')}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 m-0 leading-relaxed">
                {result.why}
              </p>
            </div>

            {/* SAFE NEXT STEP */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs">
              <span className="text-xs font-black tracking-wider text-emerald-900 uppercase block mb-1">
                🛡️ {getTranslation(effectiveLang, 'safeNextStepLabel')}
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-950 m-0 leading-relaxed">
                {result.safeNextStep}
              </p>
            </div>

            {/* TRUSTED SOURCE */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-black tracking-wider text-slate-500 uppercase block mb-1">
                🏛️ {getTranslation(effectiveLang, 'trustedSourceLabel')}
              </span>
              <div className="mt-1">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                  {result.trustedSource.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  {getSubLabel('authorityLabel', effectiveLang)}
                </span>
                {result.trustedSource.url && (
                  <a
                    href={result.trustedSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline mt-2"
                  >
                    <span>Official Source Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* SHOULD I FORWARD THIS? */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-xs font-black tracking-wider text-slate-500 uppercase block mb-1">
                📲 {getTranslation(effectiveLang, 'shouldForwardLabel')}
              </span>
              <div className="mt-1">
                <span className="inline-block font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900">
                  {result.shouldIForward.badgeText}
                </span>
                <p className="text-xs text-slate-600 mt-1.5 m-0 leading-normal font-medium">
                  {result.shouldIForward.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Copy Summary Action */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 m-0 italic font-medium">
              {getSubLabel('footerNotice', effectiveLang)}
            </p>

            <button
              onClick={handleCopySummary}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{getTranslation(effectiveLang, 'summaryCopied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{getTranslation(effectiveLang, 'copySummary')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. MYTH VS FACT CARD (Generated from actual result) */}
      <MythVsFactCard result={result} selectedLanguage={selectedLanguage} />
    </div>
  );
};
