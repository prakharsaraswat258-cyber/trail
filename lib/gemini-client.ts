/**
 * Server-only Gemini client helper using @google/genai SDK.
 * WARNING: NEVER import this file from any 'use client' component or browser code.
 */

import { GoogleGenAI } from '@google/genai';

let geminiClientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({ apiKey });
  }

  return geminiClientInstance;
}

export const GEMINI_MATCH_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
export const GEMINI_FALLBACK_MODELS = [
  GEMINI_MATCH_MODEL,
  'gemini-3.6-flash',
  'gemini-flash-latest',
];
