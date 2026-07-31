import React from 'react';
import { Lock } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../data/languages';

interface PrivacyBannerProps {
  selectedLanguage: Language;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ selectedLanguage }) => {
  return (
    <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 mb-6 text-xs text-slate-700 flex items-start gap-2.5">
      <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
      <p className="m-0 leading-relaxed font-medium">
        {getTranslation(selectedLanguage, 'privacyNotice')}
      </p>
    </div>
  );
};
