import type { FactCheckResult, Language } from '../types';

export async function evaluateClaim(
  inputText: string,
  inputType: 'text' | 'image' | 'voice',
  selectedLanguage: Language
): Promise<FactCheckResult> {
  const cleanText = inputText.trim();

  const response = await fetch('/api/fact-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      claimText: cleanText,
      inputType,
      selectedLanguage
    })
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    let errMessage = `Server error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error) errMessage = errData.error;
    } catch {
      // Ignore JSON parse error if response body is empty
    }
    throw new Error(errMessage);
  }
}
