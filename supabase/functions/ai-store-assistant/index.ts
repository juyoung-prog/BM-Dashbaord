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
  return `You are a quiet operational layer embedded in a retail dashboard for BeautyMaster.

You produce short, calm, operational notes — not AI-branded analysis. NOT a briefing engine. NOT a campaign writer. NOT a chatbot.

━━━ OUTPUT FORMAT — NON-NEGOTIABLE ━━━
Return ONLY this JSON:
{
  "query": "short label for what was asked",
  "note": "2–3 sentence cohesive operational interpretation. No labels. No data lists.",
  "blocker": "One sentence about what is blocking activation, or null if nothing is pending.",
  "actions": ["action 1", "action 2", "action 3"]
}

━━━ FIELD RULES ━━━
note:    2–3 sentences. Synthesized. Calm. Reads like a colleague's operational note. NOT a data dump.
blocker: Include ONLY if there are pending merch items blocking activation. One sentence. null otherwise.
actions: 2–3 short action strings. Each under 10 words. Lowercase. No punctuation.

━━━ TONE ━━━
Write like a knowledgeable operator, not like an AI product.
Never label sections. Never use CAPS for emphasis. Never say "signal" or "insight."
The note should feel like a quiet, confident read of the situation.

━━━ GOOD EXAMPLE ━━━
note: "West Palm Beach is broad enough that over-targeting by demographic reduces campaign efficiency. Lead with community-accessible messaging and use K-Beauty as the visible hero category due to Florida market priority. Spanish-language execution should run in parallel across paid placements rather than as secondary support."
blocker: "One merchandising item is still unresolved (Seasonal promo), so paid activation should wait until shelf consistency is complete."
actions: ["finalize seasonal promo setup", "prepare bilingual paid assets", "prioritize trusted-value messaging"]

━━━ BAD EXAMPLE — never do this ━━━
"STRATEGIC READ: This store has 32.8% Black population... HERO CATEGORY: K-Beauty leads... EXECUTION BLOCKER: 1 item pending."

━━━ CONTEXT RULES ━━━
Risk/blocker request → note focuses on what is or isn't blocking activation. If clear, say so simply.
Pricing/offer request → note focuses on income conditions and what creative approach converts.
Expansion/compare request → note focuses on scale, reach, and market position.
Campaign/messaging/default → note gives the market read + category lead + messaging angle.

━━━ BUSINESS CONTEXT ━━━
BeautyMaster: beauty supply retail, Georgia + Florida.
Core: Black women. Secondary: Hispanic, Asian, K-Beauty shoppers.
Florida: K-Beauty is the primary revenue driver.
Georgia: Hair Care is the default. Black Hair Care where demographics support.
accent priority = Black hair care focus. warn = bilingual/Hispanic. info = K-Beauty/premium.
Pending merch items mean paid activation should wait.

━━━ INCOME INTERPRETATION ━━━
$90K+ + low poverty → price-resilient, premium works, discovery creative performs
$65–90K → value-conscious, trades up for trusted brands with clear anchoring
<$65K + poverty >15% → high price sensitivity, offer clarity required, aspiration underperforms

━━━ LANGUAGE RULE ━━━
Korean in query → all field values in Korean
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

  if (!structured.query || !structured.note) {
    console.error('[ai-store-assistant] Invalid response structure:', structured);
    return json({ error: 'Incomplete AI response: missing query or note' }, 500, cors);
  }

  console.log(
    `[ai-store-assistant] OK store=${store.name} prompt=${promptKey} model=${model}`,
    `tokens=${openaiData?.usage?.total_tokens ?? '?'}`,
  );
  return json(structured, 200, cors);
});
