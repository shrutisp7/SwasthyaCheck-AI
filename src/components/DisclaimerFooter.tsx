import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import type { Language } from '../types';
import { getTranslation } from '../data/languages';

interface DisclaimerFooterProps {
  selectedLanguage: Language;
}

export const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({ selectedLanguage }) => {
  return (
    <footer className="mt-12 pt-8 border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* Main Health Safety Box */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 text-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs sm:text-sm uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{getTranslation(selectedLanguage, 'disclaimerTitle')}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed m-0 text-slate-700">
            {getTranslation(selectedLanguage, 'disclaimerBody')}
          </p>
        </div>

        {/* Emergency Call Action */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-900/10">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-extrabold text-sm sm:text-base m-0">
              🚨 Need Emergency Medical Help in India?
            </h4>
            <p className="text-xs text-red-100 m-0">
              For sudden severe pain, chest tightness, accidents, or life-threatening symptoms.
            </p>
          </div>
          <a
            href="tel:108"
            className="w-full sm:w-auto px-6 py-3 bg-white text-red-700 hover:bg-red-50 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Call 108 / 112 Emergency</span>
          </a>
        </div>

        {/* Trusted Reference Agencies */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-slate-400 text-[11px] m-0 font-medium">
            Fact-Checking Powered by Evidence from Recognized Health Authorities:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-500">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">World Health Organization (WHO)</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">MoHFW India</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Indian Council of Medical Research (ICMR)</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">NCDC India</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">PubMed / CDC</span>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="text-center text-[11px] text-slate-400 pb-8">
          SwasthyaCheck AI • Promoting Health Literacy & Combating Medical Misinformation in India
        </div>
      </div>
    </footer>
  );
};
