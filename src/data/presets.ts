import type { DemoPreset } from '../types';

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-dengue-lemon',
    badgeLabel: '🚨 Dangerous Remedy',
    title: 'Lemon Water Dengue Cure',
    text: 'Forwarded as received!!! Doctors have discovered that drinking lemon water every two hours cures dengue. Hospitals don\'t tell people because they want money. Forward this to 20 people.',
    language: 'en',
    description: 'Dangerous home-remedy myth claiming lemon water cures dengue fever and conspiracy against hospitals.'
  },
  {
    id: 'demo-hot-water-virus',
    badgeLabel: '🔴 False Claim',
    title: 'Hot Water Kills Viruses',
    text: 'Drinking hot water every 15 minutes washes viruses down into the stomach acid where they die instantly. Share to save lives!',
    language: 'en',
    description: 'False viral claim about hot water killing respiratory viruses in stomach.'
  },
  {
    id: 'demo-turmeric-cold',
    badgeLabel: '🟡 Partly True',
    title: 'Turmeric & Golden Milk',
    text: 'Drinking Haldi Doodh (turmeric milk) cures all lung infections and completely replaces antibiotics for chest diseases.',
    language: 'hi',
    description: 'Partly true claim: Turmeric has mild anti-inflammatory properties for comfort, but cannot replace antibiotics or cure lung infections.'
  },
  {
    id: 'demo-vaccine-myth',
    badgeLabel: '🔴 Vaccine Misinformation',
    title: 'Garlic Replaces Vaccines',
    text: 'Eating 5 raw garlic cloves on an empty stomach makes you 100% immune to childhood diseases so vaccines are totally unnecessary.',
    language: 'en',
    description: 'False vaccine misinformation encouraging people to skip essential immunizations.'
  },
  {
    id: 'demo-secret-herb',
    badgeLabel: '⚪ Unverifiable',
    title: 'Secret Himalayan Herb X',
    text: 'An anonymous doctor in a remote Himalayan cave found a plant called Sanjeevani-X that cures diabetes in 3 days. No medical journal has published it yet.',
    language: 'en',
    description: 'Unverifiable claim lacking scientific evidence or verifiable credentials.'
  },
  {
    id: 'demo-hinglish-mixed',
    badgeLabel: '📝 Hinglish / Typo Claim',
    title: 'Hinglish Forward Message',
    text: 'Urgent forward!! Subah khali pet kacchi adrak and laung khane se body ka blood completely purify ho jata hai aur 100 yrs tak disease nahi hota. Doctor log chupa rahe hai!!',
    language: 'hi',
    description: 'Code-mixed Hinglish input with typos, excessive punctuation, and authority mistrust.'
  }
];
