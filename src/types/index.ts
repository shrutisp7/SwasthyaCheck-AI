export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml' | 'mr' | 'bn' | 'auto';

export type VerdictType = 'TRUE' | 'PARTLY_TRUE' | 'FALSE' | 'DANGEROUS' | 'UNVERIFIED';

export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited' | 'Unable to verify';

export type ForwardRecommendation = 'Supported' | 'Missing Context' | 'Do Not Forward' | 'Potentially Dangerous';

export interface TrustedSource {
  name: string;
  url?: string;
  organization?: string;
  verifiedDate?: string;
}

export interface FactCheckResult {
  id: string;
  verdict: VerdictType;
  extractedClaim: string;
  translatedClaim?: string;
  rawInputText: string;
  inputType: 'text' | 'image' | 'voice';
  why: string;
  safeNextStep: string;
  trustedSource: TrustedSource;
  evidenceStrength: EvidenceStrength;
  shouldIForward: {
    status: ForwardRecommendation;
    badgeText: string;
    explanation: string;
  };
  shareableSummary: string;
  languageDetectedOrSelected: string;
  isEmergency: boolean;
  emergencyAlertText?: string;
  timestamp: string;
}

export interface DemoPreset {
  id: string;
  badgeLabel: string;
  title: string;
  text: string;
  language: Language;
  description: string;
}

export interface SimulatorPreset {
  id: string;
  category: 'remedy' | 'vaccine' | 'medicine' | 'nutrition' | 'disease';
  categoryLabel: string;
  title: string;
  text: string;
  language: Language;
}

export type FontSizeOption = 'normal' | 'large' | 'xlarge';


