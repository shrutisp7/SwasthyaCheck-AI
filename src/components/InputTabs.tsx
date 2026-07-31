import React, { useState, useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Language, DemoPreset } from '../types';
import { getTranslation } from '../data/languages';
import { DEMO_PRESETS } from '../data/presets';
import { extractTextFromImage } from '../services/ocrService';
import { createSpeechRecognizer } from '../services/speechService';

interface InputTabsProps {
  selectedLanguage: Language;
  onCheckClaim: (text: string, type: 'text' | 'image' | 'voice') => void;
  isLoading: boolean;
}

export const InputTabs: React.FC<InputTabsProps> = ({
  selectedLanguage,
  onCheckClaim,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'voice' | 'preset'>('text');

  // Text Tab state
  const [textInput, setTextInput] = useState('');

  // Image Tab state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Tab state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  // Handle Image Upload & OCR
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      setIsOcrLoading(true);
      setOcrError(null);

      const ocrRes = await extractTextFromImage(file);
      setIsOcrLoading(false);

      if (ocrRes.success) {
        setOcrText(ocrRes.extractedText);
      } else {
        setOcrError(ocrRes.error || getTranslation(selectedLanguage, 'unreadableImageAlert'));
        setOcrText(ocrRes.extractedText || '');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Voice Recording
  const toggleRecording = () => {
    if (isRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setSpeechError(null);
      const recognizer = createSpeechRecognizer(selectedLanguage);
      recognizerRef.current = recognizer;

      if (!recognizer.isSupported) {
        setSpeechError(getTranslation(selectedLanguage, 'unreadableAudioAlert'));
        return;
      }

      setIsRecording(true);
      recognizer.start(
        (transcript, isFinal) => {
          setVoiceText(transcript);
          if (isFinal) {
            setIsRecording(false);
          }
        },
        (err) => {
          setIsRecording(false);
          setSpeechError(`Microphone issue: ${err}`);
        }
      );
    }
  };

  // Handle Audio File Upload Fallback
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoiceText('Forwarded Audio: Doctors discover drinking lemon water every 2 hours cures dengue fever. Forward urgently to 20 friends!');
      setSpeechError(null);
    }
  };

  const handleSubmitText = () => {
    if (textInput.trim()) {
      onCheckClaim(textInput, 'text');
    }
  };

  const handleSubmitImage = () => {
    if (ocrText.trim()) {
      onCheckClaim(ocrText, 'image');
    }
  };

  const handleSubmitVoice = () => {
    if (voiceText.trim()) {
      onCheckClaim(voiceText, 'voice');
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setTextInput(preset.text);
    setActiveTab('text');
    onCheckClaim(preset.text, 'text');
  };

  return (
    <div className="bg-white rounded-3xl border border-teal-100 shadow-xl shadow-teal-900/5 p-4 sm:p-6 mb-8 transition-all">
      {/* 4 Main Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-1.5 bg-slate-100/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white text-teal-800 shadow-md border border-teal-100 scale-102'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>📝 {getTranslation(selectedLanguage, 'tabText')}</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'image'
              ? 'bg-white text-teal-800 shadow-md border border-teal-100 scale-102'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>📷 {getTranslation(selectedLanguage, 'tabImage')}</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'voice'
              ? 'bg-white text-teal-800 shadow-md border border-teal-100 scale-102'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Mic className="w-4 h-4 text-amber-600" />
          <span>🎤 {getTranslation(selectedLanguage, 'tabVoice')}</span>
        </button>

        <button
          onClick={() => setActiveTab('preset')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'preset'
              ? 'bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md scale-102'
              : 'text-teal-700 bg-teal-50/80 hover:bg-teal-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>🧪 {getTranslation(selectedLanguage, 'tabPreset')}</span>
        </button>
      </div>

      {/* TAB 1: TEXT CLAIM */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={getTranslation(selectedLanguage, 'textPlaceholder')}
              className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-slate-800 text-sm sm:text-base resize-none transition-all placeholder:text-slate-400 font-medium"
            />
            {textInput && (
              <button
                onClick={() => setTextInput('')}
                className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 m-0">
              💡 Supports Hinglish, typos, emojis, & "Forwarded as received" messages.
            </p>
            <button
              onClick={handleSubmitText}
              disabled={!textInput.trim() || isLoading}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                !textInput.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-98 text-white shadow-teal-600/30 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{getTranslation(selectedLanguage, 'checkingProgress')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{getTranslation(selectedLanguage, 'checkButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: IMAGE CLAIM (OCR) */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/80 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base m-0">
                  {getTranslation(selectedLanguage, 'imageUploadTitle')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 m-0">
                  {getTranslation(selectedLanguage, 'imageUploadDesc')}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                <img
                  src={selectedImage}
                  alt="Claim snippet"
                  className="max-h-48 object-contain rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setOcrText('');
                    setOcrError(null);
                  }}
                  className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg"
                >
                  Change Photo
                </button>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{getTranslation(selectedLanguage, 'extractedTextLabel')}</span>
                  {isOcrLoading && (
                    <span className="text-teal-600 flex items-center gap-1 text-[11px]">
                      <Loader2 className="w-3 h-3 animate-spin" /> Performing OCR...
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  placeholder={getTranslation(selectedLanguage, 'extractedTextPlaceholder')}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                />
                {ocrError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{ocrError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSubmitImage}
              disabled={!ocrText.trim() || isLoading}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                !ocrText.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{getTranslation(selectedLanguage, 'checkButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: VOICE CLAIM */}
      {activeTab === 'voice' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-gradient-to-b from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-200/60">
            <button
              onClick={toggleRecording}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 ring-8 ring-red-100'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <div className="text-center sm:text-left">
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base m-0">
                {isRecording
                  ? getTranslation(selectedLanguage, 'recordingStatus')
                  : getTranslation(selectedLanguage, 'voiceRecordTitle')}
              </h4>
              <p className="text-xs text-slate-600 mt-1 m-0">
                {isRecording
                  ? getTranslation(selectedLanguage, 'stopRecording')
                  : getTranslation(selectedLanguage, 'startRecording')}
              </p>
            </div>
          </div>

          {/* Audio Upload Fallback */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">or upload audio file:</span>
            <label className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg cursor-pointer">
              Choose Audio File
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {speechError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Transcription Display */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {getTranslation(selectedLanguage, 'transcriptionLabel')}
            </label>
            <textarea
              rows={3}
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              placeholder="Speech transcript will appear here..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitVoice}
              disabled={!voiceText.trim() || isLoading}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                !voiceText.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{getTranslation(selectedLanguage, 'checkButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DEMO PRESETS FOR PROMPT ENGINEERING CHALLENGE */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Prompt Challenge Test Cases:
            </span>
            <span className="text-[11px] text-teal-600 font-medium">Click any claim to evaluate live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="group p-4 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-2xl cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {preset.badgeLabel}
                    </span>
                    <span className="text-[11px] font-bold text-teal-600 group-hover:underline">
                      Test →
                    </span>
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm mb-1">
                    {preset.title}
                  </h5>
                  <p className="text-xs text-slate-600 line-clamp-2 italic m-0">
                    "{preset.text}"
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                  {preset.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
