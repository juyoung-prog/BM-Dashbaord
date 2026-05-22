import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://juyoung-prog.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// Detects presence of Hangul syllables, Jamo, or Compatibility Jamo
function containsKorean(text: string): boolean {
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(text);
}

// ─── Store context type ───────────────────────────────────────────────────────
interface StoreContext {
  id: number;
  name: string;
  store: string;
  state: string;
  income: number;
  poverty: number;
  black: number;
  hisp: number;
  asian: number;
  white: number;
  wage: number;
  pop: number;
  band: string;
  priorityText: string;
  priority: string;
  bannerLabel: string;
  raceLabel: string;
  msg: string;
  merch: Array<[string, string]>;
}

// ─── Prompt descriptions ──────────────────────────────────────────────────────
const PROMPT_DESCRIPTIONS: Record<string, string> = {
  summarize: "Produce a full strategic analysis: Strategic Read + Campaign Direction + Execution Concern (if blockers) + Recommended Actions.",
  messaging: "Produce a messaging-focused analysis: Strategic Read + Campaign Direction (messaging angle, channel priority) + Recommended Actions.",
  risks:     "Produce a risk-focused analysis: Strategic Read + Execution Concern (urgent if blockers exist) + Recommended Actions.",
  next:      "Produce an immediate-action analysis: Strategic Read + Execution Concern (if blockers) + Recommended Actions.",
  guide:     "Produce a campaign guidance analysis: Strategic Read + Campaign Direction (activation angle) + Recommended Actions.",
  export:    "Produce a full operational analysis: Strategic Read + Campaign Direction + Execution Concern (if blockers) + Recommended Actions.",
  playbook:  "Produce a campaign readiness analysis: Strategic Read + Execution Concern (if blockers) + Recommended Actions.",
  'merch-notes': "Produce a merchandising-focused analysis: Strategic Read + Execution Concern (if blockers, urgent) + Recommended Actions.",
  compare:   "Produce a market position analysis: Strategic Read + Market Position (label: 'Market Position') + Recommended Actions.",
};

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are the BeautyMaster Operations Intelligence Layer.

You surface operational intelligence from store data as calm, synthesized strategic analysis. You are NOT a signal card generator. NOT a data reporter. NOT a campaign brief writer. NOT a chatbot.

━━━ OUTPUT FORMAT — NON-NEGOTIABLE ━━━
Return ONLY this JSON — 2 to 4 sections:
{
  "query": "short label for what was requested",
  "sections": [
    {
      "role": "strategic-read",
      "label": "Strategic Read",
      "body": "2–3 sentence synthesized strategic interpretation.",
      "urgent": false,
      "actions": null
    }
  ]
}

━━━ SECTION ROLES ━━━
strategic-read   — Synthesized market read. State what this market IS and what it implies operationally. NOT a data summary.
campaign-direction — What the campaign approach should be: messaging angle, category lead, channel priority, income framing.
execution-concern — Include ONLY if pending merch items block activation. urgent MUST be true for this role. body = what is blocked and why it matters.
recommended-actions — Concrete next steps. body MUST be null. actions = array of 2–3 specific strings under 12 words each.

━━━ PROSE RULES ━━━
body: 2–3 sentences. Synthesized interpretation — not data repetition.
Do NOT list raw demographics. Reference them only to support a strategic point.
Do NOT use bullet points, markdown, or label prefixes like "HERO CATEGORY:" inside body.
urgent: true ONLY for execution-concern with real pending blockers. false for everything else.
actions: array of strings for recommended-actions only. null for all other roles.
Do NOT include execution-concern if there are no pending merch items.

━━━ SECTION COUNT BY REQUEST TYPE ━━━
Default / campaign / messaging → strategic-read + campaign-direction + [execution-concern if blockers] + recommended-actions
Risk / blocker request         → strategic-read + execution-concern (urgent: true if blockers) + recommended-actions
Pricing / offer request        → strategic-read + campaign-direction (label: "Revenue Profile") + recommended-actions
Expansion / compare request    → strategic-read + campaign-direction (label: "Market Position") + recommended-actions
Immediate / next action        → strategic-read + [execution-concern if blockers] + recommended-actions

━━━ GOOD EXAMPLE (Strategic Read) ━━━
"West Palm Beach behaves like a broad multicultural trade area where over-targeted demographic positioning may reduce total reach. K-Beauty should lead campaign visibility due to Florida category priority, while messaging should remain community-accessible rather than niche beauty-focused."

━━━ BAD EXAMPLE — never do this ━━━
"This store has 32.8% Black population, 24.6% Hispanic, median income $73,446, poverty rate 14.1%."

━━━ BUSINESS CONTEXT ━━━
BeautyMaster: beauty supply, Georgia + Florida.
Core audience: Black women. Secondary: Hispanic, Asian, K-Beauty shoppers.
accent = Black hair care priority. warn = Bilingual/Hispanic. info = K-Beauty/premium.
Florida: K-Beauty is the primary revenue driver across all stores.
Georgia: Hair Care is the default hero category. Black Hair Care where demographics support.
Pending merch items = activation risk — surface as execution-concern only.

━━━ INCOME INTERPRETATION ━━━
$90K+ + low poverty → price-resilient, premium viable, discovery-led creative works
$65–90K → value-conscious, will trade up for trusted brands with clear anchoring
<$65K + poverty >15% → high price sensitivity, value framing and offer clarity required

━━━ LANGUAGE RULE ━━━
Korean in query → all field values in Korean (short fragments, no prose)
English query → all field values in English

Return raw JSON only. No markdown. No text outside the JSON object.`;
}

function buildUserMessage(promptKey: string, chipLabel: string, s: StoreContext, customText?: string, lang: 'ko' | 'en' = 'en'): string {
  const done = s.merch.filter(([t]) => t === 'done').map(([, txt]) => txt);
  const pend = s.merch.filter(([t]) => t === 'pend').map(([, txt]) => txt);
  const merchSummary = [
    done.length > 0 ? `Completed: ${done.join(', ')}` : '',
    pend.length > 0 ? `Pending: ${pend.join(', ')}` : 'All merchandising items complete',
  ].filter(Boolean).join(' | ');

  const langInstruction = lang === 'ko'
    ? 'LANGUAGE INSTRUCTION: RESPOND IN KOREAN — 모든 JSON 필드값을 반드시 한국어로 작성하세요. 영어 단어 혼용 금지.'
    : 'LANGUAGE INSTRUCTION: RESPOND IN ENGLISH — write all JSON field values in English.';

  const storeContext = `STORE CONTEXT
Name: ${s.name} (${s.store})
Priority Segment: ${s.priorityText}
Income Band: ${s.bannerLabel} | Median Income: $${s.income.toLocaleString()} | Poverty Rate: ${s.poverty}%
Demographics: ${s.raceLabel} (Black ${s.black}%, Hispanic ${s.hisp}%, Asian ${s.asian}%, White ${s.white}%)
Average Wage: $${s.wage}/hr | Trade Area Population: ${s.pop.toLocaleString()}
Recommended In-Store Message: ${s.msg}
Merchandising: ${merchSummary}
Priority Flag: ${s.priority || 'general market'}`;

  if (customText) {
    return `${langInstruction}

${storeContext}

USER QUESTION
${customText}`;
  }

  const description = PROMPT_DESCRIPTIONS[promptKey] ?? PROMPT_DESCRIPTIONS['summarize'];
  return `${langInstruction}

${storeContext}

REQUEST
${description}
User selected chip: "${chipLabel}"`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const cors   = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, cors);
  }

  // 1. Verify caller JWT ───────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ error: 'Missing authorization token' }, 401, cors);
  }
  const callerJwt = authHeader.slice(7).trim();
  if (!callerJwt) {
    return json({ error: 'Missing authorization token' }, 401, cors);
  }

  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const { data: { user }, error: userErr } = await supabaseAnon.auth.getUser(callerJwt);
  if (userErr || !user) {
    console.error('[ai-store-assistant] token verification failed:', userErr?.message ?? 'null user');
    return json({ error: 'Invalid or expired token' }, 401, cors);
  }

  // 2. Parse and validate request body ─────────────────────────────────────────
  const MODE_MODEL: Record<string, string> = {
    fast:     'gpt-4o-mini',
    balanced: 'gpt-4.1-mini',
    advanced: 'gpt-4.1',
  };

  let promptKey: string, chipLabel: string, customText: string, mode: string, store: StoreContext;
  try {
    const body = await req.json();
    promptKey  = (body?.promptKey  ?? '').trim();
    chipLabel  = (body?.chipLabel  ?? '').trim();
    customText = (body?.customText ?? '').trim();
    mode       = (body?.mode       ?? '').trim();
    store      = body?.store as StoreContext;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  const model = MODE_MODEL[mode] ?? MODE_MODEL['fast'];

  if (!promptKey && !customText) return json({ error: 'promptKey or customText is required' }, 400, cors);
  if (!store?.name) return json({ error: 'store context is required' }, 400, cors);

  // 3. Get OpenAI key from Supabase secrets ─────────────────────────────────────
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('[ai-store-assistant] OPENAI_API_KEY secret is not set');
    return json({ error: 'AI service not configured' }, 500, cors);
  }

  // 4. Call OpenAI ──────────────────────────────────────────────────────────────
  const lang = containsKorean(customText || chipLabel) ? 'ko' : 'en';

  let openaiRes: Response;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:           model,
        response_format: { type: 'json_object' },
        temperature:     0.5,
        max_tokens:      3500,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user',   content: buildUserMessage(promptKey, chipLabel, store, customText || undefined, lang) },
        ],
      }),
    });
  } catch (fetchErr) {
    console.error('[ai-store-assistant] OpenAI network error:', fetchErr);
    return json({ error: 'Failed to reach AI service' }, 502, cors);
  }

  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    console.error('[ai-store-assistant] OpenAI error:', openaiRes.status, errBody);
    return json({ error: 'AI service error', detail: openaiRes.status }, 502, cors);
  }

  // 5. Parse and validate OpenAI response ───────────────────────────────────────
  const openaiData = await openaiRes.json() as {
    choices: Array<{ message: { content: string } }>;
    usage?:  { total_tokens: number };
  };

  const rawContent = openaiData?.choices?.[0]?.message?.content ?? '';
  let structured: Record<string, unknown>;
  try {
    structured = JSON.parse(rawContent);
  } catch {
    console.error('[ai-store-assistant] Failed to parse OpenAI JSON:', rawContent);
    return json({ error: 'AI response parse error' }, 500, cors);
  }

  if (!structured.query || !Array.isArray(structured.sections) || (structured.sections as unknown[]).length === 0) {
    console.error('[ai-store-assistant] Invalid response structure:', structured);
    return json({ error: 'Incomplete AI response: missing query or sections' }, 500, cors);
  }

  console.log(
    `[ai-store-assistant] OK store=${store.name} prompt=${promptKey} model=${model}`,
    `tokens=${openaiData?.usage?.total_tokens ?? '?'}`,
  );
  return json(structured, 200, cors);
});
