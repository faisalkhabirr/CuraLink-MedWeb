import { z } from 'zod';

// Request payload schemas for the HTTP layer.
//
// Everything that is (or will be) validated at the edge of the API lives here
// so it can be imported from anywhere - routes today, the AI-response
// validation in Batch 4 later - without pulling in Express.
//
// Schemas only describe the *shape* of an accepted payload. They normalize on
// purpose (trim / lowercase), which is why `validate()` writes the parsed
// value back onto req.body.

// 1-100 characters. Not trimmed: the caller's display name is stored as sent.
export const nameSchema = z.string().min(1).max(100);

// Trimmed + lowercased before the format check, so "  Foo@Bar.COM " is stored
// and looked up as "foo@bar.com" for both register and login.
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

// Raw credentials are never trimmed or case-folded - a password is byte-exact.
export const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

// The free-text search query, exported on its own for reuse (e.g. validating
// cached/echoed queries).
export const searchQueryFieldSchema = z.string().trim().min(1).max(500);

export const searchSchema = z.object({
  query: searchQueryFieldSchema,
});

// ---------------------------------------------------------------------------
// AI answer payload (what the Groq response must look like before it is cached
// or handed to the frontend).
//
// Fields were taken from src/Components/GetStartedSection.jsx, which reads
// response.data: name, type, overview, details.{how_it_works,uses,
// side_effects,warnings}, primary_treatments (guarded with .length then
// .map()-ed, so it MUST be an array - a plain string would pass the guard and
// crash), doctor_to_consult.{specialist,reason}, emergency_warning, disclaimer
// and the non-medical escape hatch error === 'non_medical_query'.
//
// Everything the prompt mandates is required; only the two blocks the UI
// renders conditionally (doctor_to_consult, emergency_warning) are optional.
// Unknown keys are stripped by zod, so only these fields ever reach a client.
// ---------------------------------------------------------------------------

// The model's "this is not a medical question" answer; the frontend branches on
// the exact literal (GetStartedSection.jsx:42), so only that literal is valid.
export const nonMedicalQuerySchema = z.object({
  error: z.literal('non_medical_query'),
});

export const medicalAnswerSchema = z.object({
  // Frontend does (data.type || '').toLowerCase() - must be a string.
  type: z.string().min(1),
  // Rendered straight into the card: <h3>{name}</h3> and <p>{overview}</p>.
  name: z.string().min(1),
  overview: z.string().min(1),
  details: z.object({
    uses: z.string(),
    how_it_works: z.string(),
    side_effects: z.string(),
    warnings: z.string(),
  }),
  // .map() is called on it unconditionally once truthy -> must be an array.
  primary_treatments: z.array(z.string()),
  doctor_to_consult: z
    .object({
      specialist: z.string(),
      reason: z.string(),
    })
    .optional(),
  emergency_warning: z.string().optional(),
  // Non-empty on purpose: the UI's `disclaimer && <p>` then always renders it,
  // so the medical disclaimer is shown with every answer, never conditional.
  disclaimer: z.string().min(1),
});

// Exactly the two payloads the frontend knows how to render.
export const aiResponseSchema = z.union([nonMedicalQuerySchema, medicalAnswerSchema]);
