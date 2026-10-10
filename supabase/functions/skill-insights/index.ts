// Supabase Edge Function: AI suggestions for a student's own portfolio and skills.
// Secrets (set with `supabase secrets set`):
//   ANTHROPIC_API_KEY   required
//   ANTHROPIC_MODEL     optional, defaults to claude-sonnet-5-5
// SUPABASE_URL and SUPABASE_ANON_KEY are provided automatically to functions.
// The student's JWT is forwarded, so every read below is limited by row level security.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const SYSTEM = `You help a college student understand their own portfolio.
Rules:
- Use only the data in the user message. Do not invent projects, skills, or achievements.
- Never say a skill or project is verified. Describe what the data shows, and say when something is self-reported.
- These are suggestions, not official assessments.
- Reply with JSON only, no preamble and no code fences, matching exactly:
{"skillsDemonstrated":[{"skill":string,"evidence":string}],"learnNext":[{"skill":string,"why":string}],"portfolioTips":[string],"roleIdeas":[{"role":string,"why":string}],"disclaimer":string}
Use at most 8 items per list. Keep each string under 300 characters.`;

function isValid(v: any): boolean {
  const ok = (s: unknown) => typeof s === 'string' && s.length > 0 && s.length <= 400;
  const list = (a: unknown, f: (x: any) => boolean) => Array.isArray(a) && a.length <= 8 && a.every(f);
  return !!v && typeof v === 'object' &&
    list(v.skillsDemonstrated, (x) => ok(x?.skill) && ok(x?.evidence)) &&
    list(v.learnNext, (x) => ok(x?.skill) && ok(x?.why)) &&
    list(v.portfolioTips, ok) &&
    list(v.roleIdeas, (x) => ok(x?.role) && ok(x?.why)) &&
    typeof v.disclaimer === 'string';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Sign in to get suggestions.' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'AI suggestions are not configured on the server.' }, 503);

  const sb = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) return json({ error: 'Sign in to get suggestions.' }, 401);
  const userId = userData.user.id;

  let targetRole = '';
  try {
    const body = await req.json();
    if (typeof body?.targetRole === 'string') targetRole = body.targetRole.slice(0, 100);
  } catch { /* empty body is fine */ }

  // Only the student's own records. RLS also applies to each query.
  const [memberships, skills, achievements] = await Promise.all([
    sb.from('project_members')
      .select('role, responsibilities, contributions, projects(title, category, technologies, status, verification_status, problem_statement)')
      .eq('user_id', userId).limit(30),
    sb.from('skill_entries')
      .select('name, proficiency, is_learning_goal, verification_status, skill_evidence(note, projects(title))')
      .eq('user_id', userId).limit(60),
    sb.from('achievements').select('title, issuer, issued_on, verification_status').eq('user_id', userId).limit(30),
  ]);
  if (memberships.error || skills.error || achievements.error) {
    return json({ error: 'Could not read your portfolio right now.' }, 500);
  }

  const payload = {
    targetRole: targetRole || null,
    projects: (memberships.data ?? []).map((m: any) => ({
      yourRole: m.role, yourResponsibilities: m.responsibilities, yourContributions: m.contributions,
      title: m.projects?.title, category: m.projects?.category, technologies: m.projects?.technologies,
      status: m.projects?.status, verificationStatus: m.projects?.verification_status,
      problem: m.projects?.problem_statement,
    })),
    skills: (skills.data ?? []).map((s: any) => ({
      name: s.name, level: s.proficiency, learningGoal: s.is_learning_goal,
      verificationStatus: s.verification_status,
      linkedProjects: (s.skill_evidence ?? []).map((e: any) => e.projects?.title).filter(Boolean),
    })),
    achievements: (achievements.data ?? []).map((a: any) => ({
      title: a.title, issuer: a.issuer, date: a.issued_on, verificationStatus: a.verification_status,
    })),
  };

  const model = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5';
  let anthropic: Response;
  try {
    anthropic = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Student data:\n${JSON.stringify(payload)}` }],
      }),
    });
  } catch {
    return json({ error: 'The AI service could not be reached. Try again later.' }, 502);
  }
  if (!anthropic.ok) return json({ error: 'The AI service returned an error. Try again later.' }, 502);

  const result = await anthropic.json();
  const text = (result.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return json({ error: 'The suggestions could not be read. Try again.' }, 502);
  }
  if (!isValid(parsed)) return json({ error: 'The suggestions came back in an unexpected format. Try again.' }, 502);
  return json(parsed);
});
