import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Handle malformed JSON body errors gracefully without crashing the server
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[Server Warning] Received malformed JSON body in request.');
    return res.status(400).json({ error: 'Invalid JSON payload in request.' });
  }
  next(err);
});

const PORT = process.env.PORT || 3001;

const SYSTEM_INSTRUCTION = `You are SwasthyaCheck AI, a calm, neutral, evidence-aware and safety-focused health misinformation fact-checking assistant designed primarily for users in India.

Your purpose is to help users understand whether health information received through messaging apps, social media, images, voice notes, or word of mouth is supported by reliable evidence.

STEP 1:
Identify the central factual health claim.
Ignore irrelevant content such as "Forwarded as received", "Share with everyone", excessive emojis, fear-based wording, conspiracy wording, emotional persuasion.
If multiple independent claims exist, evaluate the primary claim.

STEP 2:
Evaluate the claim using reliable medical and public-health evidence (WHO, MoHFW India, ICMR, NCDC, CDC, peer-reviewed literature).
Never invent citations, URLs, studies, statistics, quotations, or authority statements.

STEP 3:
Assign one verdict: TRUE, PARTLY_TRUE, FALSE, DANGEROUS, UNVERIFIED.
Prioritize DANGEROUS when a claim is false and poses health risk.

STEP 4:
Explain the verdict simply without complex medical jargon.
Do not diagnose diseases, prescribe medication, or tell users to stop prescribed treatments.

STEP 5:
CRITICAL LANGUAGE INSTRUCTION:
Return ALL user-facing explanatory fields in the requested target language.
Do NOT default to English unless target language is English.

Return JSON in this format:
{
  "originalClaim": "Original raw input claim",
  "translatedClaim": "Claim translated into target language if different from original, otherwise original",
  "verdict": "TRUE | PARTLY_TRUE | FALSE | DANGEROUS | UNVERIFIED",
  "explanation": "Clear explanation in target language",
  "safeNextStep": "Actionable safety guidance in target language",
  "evidenceStrength": "Strong | Moderate | Limited | Unable to verify",
  "sourceName": "Specific verified source name or 'Trusted source: Not available for this claim'",
  "sourceUrl": "Specific verified URL or null",
  "forwardRecommendation": "Localized advice (e.g. Do Not Forward / Supported)",
  "language": "Target language code"
}`;

const LANG_NAME_MAP = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  ml: 'Malayalam (മലയാളം)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  auto: 'Auto Detect'
};

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cannot breathe', 'shortness of breath',
  'severe bleeding', 'unconscious', 'seizure', 'paralysis', 'stroke',
  'high fever with convulsions', 'bleeding from nose and gums', 'dengue hemorrhage',
  'सीने में दर्द', 'सांस लेने में तकलीफ', 'अचेत', 'स्ट्रोक'
];

app.post('/api/fact-check', async (req, res) => {
  console.log(`\n[${new Date().toISOString()}] Received /api/fact-check request:`, req.body);
  try {
    const { claimText, inputType = 'text', selectedLanguage = 'auto' } = req.body || {};
    const cleanText = (claimText || '').trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'Please enter a health claim to check.' });
    }

    let targetLang = selectedLanguage;
    if (selectedLanguage === 'auto') {
      if (/[\u0900-\u097F]/.test(cleanText)) targetLang = 'hi';
      else if (/[\u0C80-\u0CFF]/.test(cleanText)) targetLang = 'kn';
      else if (/[\u0B80-\u0BFF]/.test(cleanText)) targetLang = 'ta';
      else if (/[\u0C00-\u0C7F]/.test(cleanText)) targetLang = 'te';
      else if (/[\u0D00-\u0D7F]/.test(cleanText)) targetLang = 'ml';
      else if (/[\u0980-\u09FF]/.test(cleanText)) targetLang = 'bn';
      else targetLang = 'en';
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // DIAGNOSTIC CHECK 1: Missing or empty API key
    if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_gemini_api_key_here') {
      console.warn('[Gemini Diagnosis] GEMINI_API_KEY is missing or unconfigured in .env file.');
      return res.status(400).json({
        error: 'AI service is not configured. Please set a valid GEMINI_API_KEY environment variable in your .env file to enable live Gemini fact-checking.'
      });
    }

    // Attempt Gemini API call across supported model endpoints
    const modelsToTry = [
      'gemini-3.1-flash-lite',
      'gemini-3.1-flash-lite-preview',
      'gemini-3-flash-preview',
      'gemini-flash-latest'
    ];

    let lastError = null;
    let isQuotaError = false;
    const langName = LANG_NAME_MAP[targetLang] || 'English';
    const userPrompt = `Target Language for response: ${langName}\nUser Submitted Health Claim:\n"${cleanText}"\n\nReturn JSON following the specified structure.`;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini Request] Calling Google Gemini API model: ${modelName}...`);
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: SYSTEM_INSTRUCTION },
                    { text: userPrompt }
                  ]
                }
              ],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonString) {
            console.log(`[Gemini Response Success] ${modelName} returned valid JSON output.`);
            const parsed = JSON.parse(jsonString);
            const formatted = formatGeminiResult(parsed, cleanText, inputType, targetLang);
            return res.json(formatted);
          }
        } else {
          const errText = await geminiRes.text();
          console.warn(`[Gemini API Error] ${modelName} returned Status ${geminiRes.status}:`, errText);
          if (geminiRes.status === 429 || errText.includes('RESOURCE_EXHAUSTED') || errText.includes('quota')) {
            isQuotaError = true;
          }
          lastError = `Status ${geminiRes.status}`;
        }
      } catch (err) {
        console.warn(`[Gemini Connection Failure] Exception calling ${modelName}:`, err.message);
        lastError = err.message;
      }
    }

    // DIAGNOSTIC CHECK 2: All Gemini API requests failed - Log detailed error on backend only
    console.error(`[Gemini Diagnosis] All model endpoints failed. Quota limit reached: ${isQuotaError}`);
    
    // Return clean user-facing message without exposing raw JSON/URLs/Stack traces
    if (isQuotaError) {
      return res.status(429).json({
        error: 'AI service is temporarily unavailable due to usage limits. Please try again shortly.'
      });
    }

    return res.status(503).json({
      error: 'AI service is temporarily unavailable. Please try again shortly.'
    });

  } catch (error) {
    console.error('Server internal error:', error);
    return res.status(500).json({ error: 'Internal server error processing health claim.' });
  }
});

function formatGeminiResult(parsed, rawInput, inputType, targetLang) {
  const validVerdicts = ['TRUE', 'PARTLY_TRUE', 'FALSE', 'DANGEROUS', 'UNVERIFIED'];
  const verdict = validVerdicts.includes(parsed.verdict) ? parsed.verdict : 'UNVERIFIED';

  let sourceName = parsed.sourceName || 'Trusted source: Not available for this claim';
  let sourceUrl = parsed.sourceUrl || null;
  if (!sourceUrl || sourceName.includes('Not available') || sourceUrl === 'null' || sourceUrl === 'undefined') {
    sourceName = 'Trusted source: Not available for this claim';
    sourceUrl = null;
  }

  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => rawInput.toLowerCase().includes(kw));

  return {
    id: `check-${Date.now()}`,
    verdict,
    extractedClaim: parsed.originalClaim || rawInput,
    translatedClaim: parsed.translatedClaim || parsed.originalClaim || rawInput,
    rawInputText: rawInput,
    inputType,
    why: parsed.explanation || 'We could not reliably verify this claim with the evidence currently available.',
    safeNextStep: parsed.safeNextStep || 'Do not make health decisions based only on this message. Consult a registered doctor.',
    trustedSource: {
      name: sourceName,
      url: sourceUrl
    },
    evidenceStrength: parsed.evidenceStrength || (verdict === 'UNVERIFIED' ? 'Unable to verify' : 'Strong'),
    shouldIForward: {
      status: verdict === 'TRUE' ? 'Supported' : verdict === 'PARTLY_TRUE' ? 'Missing Context' : verdict === 'DANGEROUS' ? 'Potentially Dangerous' : 'Do Not Forward',
      badgeText: getForwardBadgeText(verdict, targetLang),
      explanation: parsed.forwardRecommendation || 'Do not share unverified health advice on social messaging apps.'
    },
    shareableSummary: `${verdict}: ${parsed.translatedClaim || rawInput}. Always consult a doctor for medical advice.`,
    languageDetectedOrSelected: targetLang,
    isEmergency,
    emergencyAlertText: isEmergency
      ? '🚨 WARNING: Immediate medical symptoms detected. Do NOT rely on home remedies. Call 108 or 112 immediately!'
      : undefined,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
  };
}

function getForwardBadgeText(verdict, lang) {
  if (lang === 'hi') {
    if (verdict === 'TRUE') return '✅ समर्थित - संदर्भ के साथ शेयर करें';
    if (verdict === 'PARTLY_TRUE') return '⚠️ अधूरा संदर्भ - बिना स्पष्टीकरण शेयर न करें';
    if (verdict === 'DANGEROUS') return '🚨 आगे न भेजें - खतरनाक स्वास्थ्य सलाह';
    return '❌ आगे न भेजें - अपुष्ट या गलत संदेश';
  }
  if (lang === 'kn') {
    if (verdict === 'TRUE') return '✅ ಬೆಂಬಲಿತವಾಗಿದೆ';
    if (verdict === 'PARTLY_TRUE') return '⚠️ ಅಸ್ಪಷ್ಟ ಮಾಹಿತಿ';
    if (verdict === 'DANGEROUS') return '🚨 ಫಾರ್ವರ್ಡ್ ಮಾಡಬೇಡಿ - ಅಪಾಯಕಾರಿ';
    return '❌ ಫಾರ್ವರ್ಡ್ ಮಾಡಬೇಡಿ';
  }
  if (lang === 'ta') {
    if (verdict === 'TRUE') return '✅ ஆதாரமுள்ளது';
    if (verdict === 'PARTLY_TRUE') return '⚠️ பகுதி உண்மை';
    if (verdict === 'DANGEROUS') return '🚨 பகிர வேண்டாம் - ஆபத்தானது';
    return '❌ பகிர வேண்டாம்';
  }
  if (lang === 'te') {
    if (verdict === 'TRUE') return '✅ మద్దతు ఉంది';
    if (verdict === 'PARTLY_TRUE') return '⚠️ పాక్షికంగా నిజం';
    if (verdict === 'DANGEROUS') return '🚨 ఫార్వర్డ్ చేయవద్దు - ప్రమాదకరం';
    return '❌ ఫార్వర్డ్ చేయవద్దు';
  }
  if (verdict === 'TRUE') return '✅ Supported - Share with context';
  if (verdict === 'PARTLY_TRUE') return '⚠️ Missing Context - Avoid forwarding without context';
  if (verdict === 'DANGEROUS') return '🚨 Do Not Forward - Potentially dangerous claim';
  return '❌ Do Not Forward - Unverified health claim';
}

app.listen(PORT, () => {
  console.log(`SwasthyaCheck AI Backend running on port ${PORT}`);
});
