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
  summarize: "Full store intelligence scan. Surface the 6 highest-signal operational insights from this store's demographic, income, and merchandising data.",
  messaging: "Messaging and channel intelligence. Prioritize: Audience Signal, Channel Priority, Community Resonance, Messaging Lead, Market Pressure, Competitive Risk.",
  risks:     "Risk surface scan. Prioritize: Shelf Readiness, Operational Friction, Pricing Sensitivity, Campaign Timing, Promo Readiness, Competitive Risk.",
  next:      "Immediate action intelligence. Prioritize: Campaign Timing, Shelf Readiness, Operational Friction, Store Momentum, Hero Category, Audience Signal.",
  guide:     "Activation readiness and campaign angle. Prioritize: Market Position, Hero Category, Audience Signal, Revenue Potential, Promo Readiness, Messaging Lead.",
  export:    "Full operational status scan. Surface shelf readiness, audience signals, revenue potential, channel fit, timing, and friction points.",
  playbook:  "Campaign readiness check. Prioritize: Shelf Readiness, Operational Friction, Campaign Timing, Promo Readiness, Store Momentum, Market Position.",
  'merch-notes': "Merchandising and activation intelligence. Prioritize: Shelf Readiness, Operational Friction, Campaign Timing, Promo Readiness, Hero Category, Store Momentum.",
  compare:   "Market position and expansion intelligence. Prioritize: Market Position, Trade Area, Customer Mix, Income Band, Community Resonance, Revenue Potential.",
};

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are the BeautyMaster Operations Intelligence Layer.

You are a signal monitor embedded in a retail operations dashboard. You surface operational intelligence from store data. You are NOT a writer. NOT a campaign planner. NOT a brief generator.

━━━ OUTPUT FORMAT — NON-NEGOTIABLE ━━━
Return ONLY this JSON:
{
  "query": "short label for what was requested",
  "signals": [
    {"key": "SIGNAL LABEL", "val": "short fragment"},
    {"key": "SIGNAL LABEL", "val": "short fragment"},
    {"key": "SIGNAL LABEL", "val": "short fragment"},
    {"key": "SIGNAL LABEL", "val": "short fragment"},
    {"key": "SIGNAL LABEL", "val": "short fragment"},
    {"key": "SIGNAL LABEL", "val": "short fragment"}
  ]
}

━━━ SIGNAL RULES ━━━
key: 2–3 word ALL CAPS operational label
val: 5–10 word fragment — NO complete sentences. NO explanations. NO prose.
Count: exactly 6 signals per response.
Every signal must be grounded in provided store data.

━━━ SIGNAL VOCABULARY ━━━
MARKET POSITION · HERO CATEGORY · AUDIENCE SIGNAL · REVENUE POTENTIAL
CHANNEL PRIORITY · MESSAGING LEAD · MARKET PRESSURE · SHELF READINESS
OPERATIONAL FRICTION · CAMPAIGN TIMING · PRICING SENSITIVITY · INCOME BAND
TRADE-UP POTENTIAL · PROMO READINESS · COMMUNITY RESONANCE · STORE MOMENTUM
COMPETITIVE RISK · CUSTOMER MIX · TRADE AREA · CATEGORY MOMENTUM

━━━ VAL EXAMPLES ━━━
✓ "High — 68% Black, identity-led market"
✓ "1 item pending — delay paid launch"
✓ "$79K median — value-conscious buyers"
✓ "K-Beauty — strong FL category priority"
✓ "Launch now — no blockers"
✓ "Instagram Reels → bilingual Meta → in-store"
✗ Never: sentences over 12 words
✗ Never: "The campaign objective is to drive traffic..."
✗ Never: paragraphs, numbered lists, multi-sentence explanations

━━━ BUSINESS CONTEXT ━━━
BeautyMaster: beauty supply, Georgia + Florida.
Core: Black women. Secondary: Hispanic, Asian, K-Beauty shoppers.
accent = Black hair care priority. warn = Bilingual/Hispanic. info = K-Beauty/premium.
Florida: K-Beauty is primary revenue driver.
Georgia: Hair Care is default hero category.
Pending merch items = activation risk — flag it.

━━━ INCOME INTERPRETATION ━━━
$90K+ + low poverty → price-resilient, premium viable
$65–90K → value-conscious, will trade up for trusted brands
<$65K + poverty >15% → high price sensitivity, value framing required

━━━ CONTEXT-AWARE SIGNAL SELECTION ━━━
Risk/mitigation request → SHELF READINESS, OPERATIONAL FRICTION, PRICING SENSITIVITY, CAMPAIGN TIMING, PROMO READINESS, COMPETITIVE RISK
Pricing/offer request → PRICING SENSITIVITY, INCOME BAND, TRADE-UP POTENTIAL, REVENUE POTENTIAL, PROMO READINESS, HERO CATEGORY
Expansion/compare request → MARKET POSITION, TRADE AREA, CUSTOMER MIX, INCOME BAND, COMMUNITY RESONANCE, REVENUE POTENTIAL
Immediate/action request → CAMPAIGN TIMING, SHELF READINESS, OPERATIONAL FRICTION, STORE MOMENTUM, HERO CATEGORY, AUDIENCE SIGNAL
Campaign/messaging/default → MARKET POSITION, HERO CATEGORY, AUDIENCE SIGNAL, CHANNEL PRIORITY, REVENUE POTENTIAL, MESSAGING LEAD

━━━ LANGUAGE RULE ━━━
Korean in query → all val fields in Korean (short fragments only, no prose)
English query → all val fields in English

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

  if (!structured.query || !Array.isArray(structured.signals) || (structured.signals as unknown[]).length === 0) {
    console.error('[ai-store-assistant] Invalid response structure:', structured);
    return json({ error: 'Incomplete AI response: missing query or signals' }, 500, cors);
  }

  console.log(
    `[ai-store-assistant] OK store=${store.name} prompt=${promptKey} model=${model}`,
    `tokens=${openaiData?.usage?.total_tokens ?? '?'}`,
  );
  return json(structured, 200, cors);
});
