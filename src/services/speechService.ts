import type { Language } from '../types';

export interface SpeechRecognitionController {
  start: (onTranscript: (text: string, isFinal: boolean) => void, onError: (err: string) => void) => void;
  stop: () => void;
  isSupported: boolean;
}

export function createSpeechRecognizer(language: Language): SpeechRecognitionController {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return {
      start: (_onTranscript, onError) => {
        onError('Browser Speech Recognition is not supported on this device. You can type or upload an audio file instead.');
      },
      stop: () => {},
      isSupported: false
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  // Set language BCP 47 code
  const langMap: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    auto: 'en-IN'
  };

  recognition.lang = langMap[language] || 'en-IN';

  let isListening = false;

  return {
    isSupported: true,
    start: (onTranscript, onError) => {
      if (isListening) return;
      isListening = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onTranscript(finalTranscript || interimTranscript, !!finalTranscript);
      };

      recognition.onerror = (event: any) => {
        isListening = false;
        onError(event.error || 'Microphone recording error');
      };

      recognition.onend = () => {
        isListening = false;
      };

      try {
        recognition.start();
      } catch (err) {
        isListening = false;
        onError('Microphone permission required or already active.');
      }
    },
    stop: () => {
      if (isListening) {
        recognition.stop();
        isListening = false;
      }
    }
  };
}

export function speakText(text: string, language: Language, onEnd?: () => void): boolean {
  if (!('speechSynthesis' in window)) return false;

  window.speechSynthesis.cancel(); // Stop any current speech

  const utterance = new SpeechSynthesisUtterance(text);
  
  const langMap: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    auto: 'en-IN'
  };

  utterance.lang = langMap[language] || 'en-IN';
  utterance.rate = 0.9; // Slightly slower pace for clarity & elderly readability
  utterance.pitch = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
