import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputTabs } from './components/InputTabs';
import { FactCheckCard } from './components/FactCheckCard';
import { PrivacyBanner } from './components/PrivacyBanner';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { ForwardSimulator } from './components/ForwardSimulator';
import type { FactCheckResult, Language, FontSizeOption } from './types';
import { evaluateClaim } from './services/aiFactChecker';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('auto');
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [familySafeMode, setFamilySafeMode] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<FactCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<FactCheckResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedChecks, setSavedChecks] = useState<FactCheckResult[]>([]);

  // Load history and bookmarks from LocalStorage on startup
  useEffect(() => {
    try {
      // 1. History
      const savedHistory = localStorage.getItem('swasthya_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      // 2. Bookmarks
      const savedBookmarks = localStorage.getItem('swasthya_saved_checks');
      if (savedBookmarks) {
        setSavedChecks(JSON.parse(savedBookmarks));
      }

      localStorage.removeItem('swasthya_gemini_key');
      sessionStorage.removeItem('swasthya_gemini_key');
      localStorage.removeItem('swasthya_user_session');
      sessionStorage.removeItem('swasthya_user_session');
    } catch (e) {
      console.warn('Storage initialization error:', e);
    }
  }, []);

  // Save history updates
  const saveToHistory = (newResult: FactCheckResult) => {
    const updated = [newResult, ...history.filter((h) => h.id !== newResult.id)].slice(0, 25);
    setHistory(updated);
    try {
      localStorage.setItem('swasthya_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('swasthya_history');
    } catch (e) {}
  };

  // Toggle Bookmark
  const handleToggleBookmark = (item: FactCheckResult) => {
    const exists = savedChecks.some((s) => s.id === item.id);
    let updated: FactCheckResult[];
    if (exists) {
      updated = savedChecks.filter((s) => s.id !== item.id);
    } else {
      updated = [item, ...savedChecks];
    }
    setSavedChecks(updated);
    try {
      localStorage.setItem('swasthya_saved_checks', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save bookmark:', e);
    }
  };

  // Evaluate Claim Handler
  const handleCheckClaim = async (text: string, type: 'text' | 'image' | 'voice') => {
    setCurrentResult(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await evaluateClaim(text, type, selectedLanguage);
      setCurrentResult(result);
      saveToHistory(result);
    } catch (err: any) {
      console.error('Fact check evaluation error:', err);
      setErrorMessage(err.message || 'AI request failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Font Size Class Generator
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-scale-large font-size-lg';
      case 'xlarge':
        return 'text-scale-xlarge font-size-xl';
      case 'normal':
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900 ${getFontSizeClass()}`}>
      {/* App Header with Controls */}
      <Header
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        familySafeMode={familySafeMode}
        onToggleFamilySafeMode={() => setFamilySafeMode(!familySafeMode)}
      />

      {/* Main Page Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Privacy Banner */}
        <PrivacyBanner selectedLanguage={selectedLanguage} />

        {/* Core Input Options (Text, Image, Voice, Demo Presets) */}
        <InputTabs
          selectedLanguage={selectedLanguage}
          onCheckClaim={handleCheckClaim}
          isLoading={isLoading}
        />

        {/* API Error Message Banner */}
        {errorMessage && !isLoading && (
          <div className="bg-amber-50 border-2 border-amber-400 text-amber-950 p-5 rounded-2xl mb-8 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm sm:text-base m-0 text-amber-950">
                Configuration / Network Alert
              </h4>
              <p className="text-xs sm:text-sm mt-1 m-0 leading-relaxed font-medium">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Fact-Check Result Card (Includes Standard + Family Safe Card + Myth vs Fact Card) */}
        {currentResult && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FactCheckCard
              result={currentResult}
              selectedLanguage={selectedLanguage}
              familySafeMode={familySafeMode}
              onSaveCheck={handleToggleBookmark}
              isSaved={savedChecks.some((s) => s.id === currentResult.id)}
            />
          </div>
        )}

        {/* WhatsApp Forward Simulator Section */}
        <ForwardSimulator
          selectedLanguage={selectedLanguage}
          onVerifyClaim={async (claimText, type) => {
            await handleCheckClaim(claimText, type);
          }}
          isLoading={isLoading}
        />

        {/* Empty state hint if no claim analyzed yet */}
        {!currentResult && !errorMessage && !isLoading && (
          <div className="text-center py-10 px-4 bg-white/60 border border-slate-200/80 rounded-3xl mb-8">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base m-0">
              Ready to verify health messages
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 m-0 leading-relaxed">
              Type or paste a message above, upload a screenshot photo, record a voice note, or test the WhatsApp Forward Simulator below to view instant fact-checks.
            </p>
          </div>
        )}
      </main>

      {/* Footer & Emergency Info */}
      <DisclaimerFooter selectedLanguage={selectedLanguage} />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setErrorMessage(null);
          setCurrentResult(item);
        }}
        onClearHistory={handleClearHistory}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}

export default App;
