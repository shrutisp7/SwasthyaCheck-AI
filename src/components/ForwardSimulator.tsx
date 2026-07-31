import React, { useState } from 'react';
import { MessageSquare, Forward, ShieldAlert, CheckCircle, Search, AlertCircle, Sparkles } from 'lucide-react';
import type { Language, SimulatorPreset, FactCheckResult } from '../types';
import { getTranslation } from '../data/languages';

interface ForwardSimulatorProps {
  selectedLanguage: Language;
  onVerifyClaim: (claimText: string, type: 'text') => Promise<void>;
  isLoading: boolean;
}

export const ForwardSimulator: React.FC<ForwardSimulatorProps> = ({
  selectedLanguage,
  onVerifyClaim,
  isLoading,
}) => {
  const effectiveLang = selectedLanguage === 'auto' ? 'en' : selectedLanguage;

  // Localized presets for 5 categories
  const simulatorPresets: Record<string, SimulatorPreset[]> = {
    en: [
      {
        id: 'sim-remedy',
        category: 'remedy',
        categoryLabel: 'Home Remedy',
        title: 'Lemon Dengue Cure',
        text: 'URGENT 🚨\n\nDrinking lemon water every two hours completely cures dengue.\n\nDoctors don\'t tell people because hospitals want money.\n\nForward this to your family!',
        language: 'en'
      },
      {
        id: 'sim-vaccine',
        category: 'vaccine',
        categoryLabel: 'Vaccines',
        title: 'Garlic Vaccine Replacement',
        text: 'ALERT ⚠️\n\nEating 5 raw garlic cloves on an empty stomach makes children 100% immune to all viral diseases, making vaccines completely unnecessary.\n\nShare with all parent groups!',
        language: 'en'
      },
      {
        id: 'sim-medicine',
        category: 'medicine',
        categoryLabel: 'Medicine',
        title: 'BP Medicine Replacement',
        text: 'IMPORTANT NOTICE 💊\n\nStopping high blood pressure medicine and drinking raw neem juice every morning permanently cures hypertension within 7 days.\n\nForward to all senior citizens!',
        language: 'en'
      },
      {
        id: 'sim-nutrition',
        category: 'nutrition',
        categoryLabel: 'Nutrition',
        title: 'Hot Water Kills Virus',
        text: 'DOCTOR ADVICE ☕\n\nDrinking hot water every 15 minutes washes all respiratory viruses into the stomach acid where they die instantly.\n\nForward to save lives!',
        language: 'en'
      },
      {
        id: 'sim-disease',
        category: 'disease',
        categoryLabel: 'Diseases',
        title: 'Mosquito Clove Oil Myth',
        text: 'HEALTH TIP 🦟\n\nMosquito bites cannot spread malaria or dengue if you burn clove oil in your bedroom at night.\n\nPlease share in all WhatsApp groups!',
        language: 'en'
      }
    ],
    hi: [
      {
        id: 'sim-remedy-hi',
        category: 'remedy',
        categoryLabel: 'घरेलू नुस्खे',
        title: 'नींबू पानी डेंगू इलाज',
        text: 'अति आवश्यक 🚨\n\nहर दो घंटे में नींबू पानी पीने से डेंगू पूरी तरह ठीक हो जाता है।\n\nडॉक्टर यह नहीं बताते क्योंकि अस्पतालों को पैसे चाहिए।\n\nअपने परिवार को तुरंत फॉरवर्ड करें!',
        language: 'hi'
      },
      {
        id: 'sim-vaccine-hi',
        category: 'vaccine',
        categoryLabel: 'टीकाकरण',
        title: 'लहसुन वैक्सीन विकल्प',
        text: 'सावधान ⚠️\n\nसुबह खाली पेट 5 कच्चे लहसुन खाने से बच्चों की इम्युनिटी 100% हो जाती है और वैक्सीन की कोई जरूरत नहीं रहती।\n\nसभी पेरेंट्स ग्रुप में शेयर करें!',
        language: 'hi'
      },
      {
        id: 'sim-medicine-hi',
        category: 'medicine',
        categoryLabel: 'दवाइयां',
        title: 'बीपी दवा बंद करें',
        text: 'जरूरी सूचना 💊\n\nहाई ब्लड प्रेशर की दवा बंद करके सुबह नीम का जूस पीने से बीपी 7 दिन में जड़ से ठीक हो जाता है।\n\nसभी बुजुर्गों को भेजें!',
        language: 'hi'
      },
      {
        id: 'sim-nutrition-hi',
        category: 'nutrition',
        categoryLabel: 'पोषण',
        title: 'गर्म पानी से वायरस नष्ट',
        text: 'डॉक्टर सलाह ☕\n\nहर 15 मिनट में गर्म पानी पीने से गले का वायरस पेट के एसिड में जाकर तुरंत खत्म हो जाता है।\n\nजान बचाने के लिए शेयर करें!',
        language: 'hi'
      },
      {
        id: 'sim-disease-hi',
        category: 'disease',
        categoryLabel: 'बीमारियां',
        title: 'लौंग तेल मच्छर नुस्खा',
        text: 'स्वास्थ्य टिप 🦟\n\nरात को कमरे में लौंग का तेल जलाने से मच्छर काटने पर भी डेंगू या मलेरिया नहीं होता।\n\nसभी ग्रुपों में भेजें!',
        language: 'hi'
      }
    ]
  };

  const activePresets = simulatorPresets[effectiveLang] || simulatorPresets['en'];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(activePresets[0].id);

  const currentPreset = activePresets.find(p => p.id === selectedPresetId) || activePresets[0];

  const handleRunVerification = () => {
    onVerifyClaim(currentPreset.text, 'text');
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white my-8 shadow-2xl border border-emerald-500/30">
      {/* Simulator Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold m-0 text-white tracking-tight">
            {getTranslation(effectiveLang, 'forwardSimulatorTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200/80 m-0 font-medium mt-0.5">
            {getTranslation(effectiveLang, 'forwardSimulatorSubtitle')}
          </p>
        </div>
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {activePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelectedPresetId(preset.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedPresetId === preset.id
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-white/10 text-emerald-200 hover:bg-white/20'
            }`}
          >
            {preset.categoryLabel}
          </button>
        ))}
      </div>

      {/* WhatsApp Style Chat Card Preview */}
      <div className="max-w-xl mx-auto bg-slate-800/90 rounded-2xl border border-emerald-500/20 p-4 sm:p-5 shadow-inner relative">
        {/* Forwarded Header */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-3 italic">
          <Forward className="w-4 h-4 text-emerald-400" />
          <span>{getTranslation(effectiveLang, 'forwardedBadge')}</span>
        </div>

        {/* Fictional Message Bubble */}
        <div className="bg-emerald-900/60 border border-emerald-700/50 text-emerald-50 p-4 rounded-xl rounded-tl-none font-sans text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-md">
          {currentPreset.text}
        </div>

        {/* Time & Read Receipts Fictional Stamp */}
        <div className="text-right text-[11px] text-emerald-300/60 mt-2 font-mono">
          Received 10:42 AM • Forwarded 5 times
        </div>

        {/* Verify Action Button */}
        <div className="mt-5 border-t border-emerald-500/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-emerald-200/90 font-medium">
            Test how SwasthyaCheck verifies this forwarded claim before sharing.
          </div>

          <button
            onClick={handleRunVerification}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{getTranslation(effectiveLang, 'verifyBeforeForwarding')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
