// Disclaimer text is defined exactly once here and used in three places:
//  1. inside MEDICAL_SYSTEM_PROMPT (the model must echo it),
//  2. required as a non-empty string by aiResponseSchema, so it can never be
//     dropped from a cached/validated answer,
//  3. inside the static EMERGENCY_RESPONSE payload.
// The UI renders it whenever it is present - every payload we return therefore
// guarantees it is present and non-empty, i.e. it is always shown.
export const MEDICAL_DISCLAIMER =
  'This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.';

export const MEDICAL_SYSTEM_PROMPT = `
You are a medical information assistant.
You MUST respond ONLY with a strict JSON object. No markdown, no conversational text, no preambles, and no postscripts.
If the query is NOT related to medical information, medications, diseases, symptoms, or health, return exactly this JSON: {"error": "non_medical_query"}

Otherwise, return a JSON object with the following exact structure:
{
  "type": "disease | medication | symptom | general",
  "name": "Name of the medical entity",
  "overview": "Brief overview of what it is",
  "details": {
    "uses": "Primary uses or indications (if medication) or symptoms (if disease)",
    "how_it_works": "Mechanism of action or pathophysiology",
    "side_effects": "Common and severe side effects or complications",
    "warnings": "Contraindications or special precautions"
  },
  "doctor_to_consult": {
    "specialist": "Type of specialist to see (e.g., Cardiologist, Dermatologist, General Practitioner)",
    "reason": "Why this particular type of doctor is needed"
  },
  "primary_treatments": ["List of first-line treatments or medications"],
  "emergency_warning": "Warning signs that indicate immediate emergency medical attention is needed",
  "disclaimer": "${MEDICAL_DISCLAIMER}"
}

Remember to ALWAYS include the disclaimer about consulting a doctor. Ensure all keys and values in the JSON are properly escaped strings, and do not use any formatting like backticks around the JSON output.
`;

// Appended to MEDICAL_SYSTEM_PROMPT for the single retry, when the first
// answer parsed as JSON but did not match the shape the frontend needs
// (aiResponseSchema in ../validation/schemas.js).
export const STRICT_FORMAT_INSTRUCTION = `
CRITICAL CORRECTION: your previous answer did NOT match the required structure and was rejected.
Send the answer again as ONE JSON object with every key present and correctly typed:
- "type": non-empty string, one of "disease", "medication", "symptom", "general".
- "name": non-empty string.
- "overview": non-empty string.
- "details": an OBJECT with the string keys "uses", "how_it_works", "side_effects", "warnings".
- "primary_treatments": an ARRAY of strings (for example ["ibuprofen"]), never a single string.
- "doctor_to_consult": an OBJECT with the string keys "specialist" and "reason".
- "emergency_warning": a string.
- "disclaimer": the full educational disclaimer string from your instructions.
No markdown, no commentary, no extra keys, no null values.
`;

// Red-flag symptoms: a matched query is answered with EMERGENCY_RESPONSE and
// the Groq call is skipped entirely (checked in the controller BEFORE the
// cache and before the API call, so we never pay for a query we redirect).
// Kept deliberately short; matches are substring tests on the normalized
// (trimmed, lowercased) query, so 'suicid' covers suicide/suicidal.
export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'difficulty breathing',
  'trouble breathing',
  "can't breathe",
  'cant breathe',
  'severe bleeding',
  'uncontrolled bleeding',
  'suicid',
  'kill myself',
  'end my life',
  'stroke',
  'face drooping',
  'slurred speech',
  'unconscious',
  'not breathing',
  'overdose',
  'heart attack',
  'crushing chest',
  'anaphylaxis',
  'throat closing',
  'seizure',
  'hurt myself',
  'self harm',
  'poisoned',
  'swallowed poison',
];

// Static answer for an emergency-keyword query. Shaped exactly like a normal
// answer (it is checked against aiResponseSchema at startup) so the frontend
// renders it with the same card, and it always carries the disclaimer.
// type: 'general' so neither the Medicine nor the Symptoms tab rejects it.
export const EMERGENCY_RESPONSE = {
  type: 'general',
  name: 'This may be a medical emergency',
  overview:
    'Your search mentions symptoms that can be signs of a life-threatening condition, so we are not going to make you wait for an AI answer. Call your local emergency number now, or go to the nearest emergency department.',
  details: {
    uses: 'Severe or sudden chest pain, breathing difficulty, heavy bleeding, stroke signs and similar red-flag symptoms.',
    how_it_works:
      'These symptoms can indicate a heart attack, stroke, airway obstruction or major blood loss, where minutes change the outcome and an online answer cannot rule anything out.',
    side_effects: 'Waiting, researching or driving yourself with these symptoms can cost critical time.',
    warnings: 'If symptoms are severe, rapidly worsening, or you are unsure, treat it as an emergency.',
  },
  primary_treatments: [
    'Call your local emergency number immediately (911 in the US, 112 in the EU and many other countries)',
    'Stop exertion, sit or lie down somewhere safe, and stay with the person if it is not you',
    'Do not drive yourself - wait for an ambulance or have someone else drive you',
  ],
  doctor_to_consult: {
    specialist: 'Emergency services / nearest emergency department',
    reason:
      'These symptoms need in-person assessment right now; no online answer can rule out a life-threatening condition.',
  },
  emergency_warning:
    'Call emergency services now - do not wait to see whether the symptoms improve on their own.',
  disclaimer: MEDICAL_DISCLAIMER,
};
