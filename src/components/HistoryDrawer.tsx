import React from 'react';
import { X, History, Trash2, ChevronRight, Clock } from 'lucide-react';
import type { FactCheckResult, Language } from '../types';
import { getTranslation } from '../data/languages';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: FactCheckResult[];
  onSelectHistoryItem: (item: FactCheckResult) => void;
  onClearHistory: () => void;
  selectedLanguage: Language;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  selectedLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-base m-0">
              {getTranslation(selectedLanguage, 'previousChecks')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{getTranslation(selectedLanguage, 'noHistory')}</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3.5 bg-slate-50 hover:bg-teal-50/60 border border-slate-200 rounded-2xl cursor-pointer transition-all hover:shadow-xs flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      item.verdict === 'TRUE' ? 'bg-emerald-100 text-emerald-800' :
                      item.verdict === 'PARTLY_TRUE' ? 'bg-amber-100 text-amber-800' :
                      item.verdict === 'DANGEROUS' ? 'bg-red-100 text-red-800' :
                      item.verdict === 'FALSE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {item.verdict}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-2 m-0 group-hover:text-teal-700">
                    "{item.extractedClaim}"
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 px-4 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{getTranslation(selectedLanguage, 'clearHistory')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
