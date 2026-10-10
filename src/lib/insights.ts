import { supabase } from './supabase';

/** AI output. These are suggestions for the student, never verification. */
export interface SkillInsights {
  skillsDemonstrated: { skill: string; evidence: string }[];
  learnNext: { skill: string; why: string }[];
  portfolioTips: string[];
  roleIdeas: { role: string; why: string }[];
  disclaimer: string;
}

const MAX_ITEMS = 8;
const MAX_TEXT = 400;

const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= MAX_TEXT;
const isListOf = <T>(v: unknown, check: (x: unknown) => x is T): v is T[] =>
  Array.isArray(v) && v.length <= MAX_ITEMS && v.every(check);

/** Rejects anything the model returned that does not match the expected shape. */
export function isSkillInsights(value: unknown): value is SkillInsights {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    isListOf(v.skillsDemonstrated, (x): x is { skill: string; evidence: string } =>
      !!x && typeof x === 'object' && isText((x as any).skill) && isText((x as any).evidence)) &&
    isListOf(v.learnNext, (x): x is { skill: string; why: string } =>
      !!x && typeof x === 'object' && isText((x as any).skill) && isText((x as any).why)) &&
    isListOf(v.portfolioTips, isText) &&
    isListOf(v.roleIdeas, (x): x is { role: string; why: string } =>
      !!x && typeof x === 'object' && isText((x as any).role) && isText((x as any).why)) &&
    typeof v.disclaimer === 'string'
  );
}

export async function getSkillInsights(targetRole: string): Promise<SkillInsights> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke('skill-insights', {
    body: { targetRole: targetRole.trim().slice(0, 100) },
  });
  if (error) throw new Error('Suggestions are unavailable right now. Please try again later.');
  if (!isSkillInsights(data)) throw new Error('The suggestions came back in an unexpected format. Please try again.');
  return data;
}
