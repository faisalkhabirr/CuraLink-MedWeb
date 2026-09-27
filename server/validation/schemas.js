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
