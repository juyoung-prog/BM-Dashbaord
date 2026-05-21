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
  summarize:      "Provide a comprehensive strategic summary of this store's market position, primary audience, and operational readiness.",
  messaging:      "Suggest a specific campaign messaging strategy tailored to this store's primary demographic segment and income band.",
  risks:          "Identify the key marketing and operational risks for this store and recommend concrete mitigation steps.",
  next:           "Recommend the single highest-impact next action for this store based on its current merchandising status and market profile.",
  guide:          "Provide campaign guide direction for this store's primary segment, including creative approach and channel strategy.",
  export:         "Summarize all key data points for this store in a concise brief format suitable for field reps or regional managers.",
  playbook:       "Review the store's playbook compliance status and provide specific, prioritized next steps.",
  'merch-notes':  "Analyze the current merchandising status and provide actionable, prioritized notes for any outstanding items.",
  compare:        "Benchmark this store against similar locations in the network and identify the most replicable opportunity.",
};

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are Beauty Master’s Creative and Marketing Strategist.

Use the provided dashboard/store data first. Based on store-level market data, campaign goals, channel characteristics, proven content patterns, and leadership business rules, create practical and localized campaign strategies that can be used immediately.

Business context:
- Beauty Master is a beauty supply retailer.
- The core audience is Black women.
- Secondary audiences may include Hispanic customers, Asian customers, K-Beauty customers, family shoppers, beauty professionals, and reseller customers.
- Campaign types may include openings, promotions, events, recruitment, awareness, traffic, and conversion.
- Channels may include Instagram, TikTok, flyers, posters, in-store digital screens, website banners, paid social, email, SMS, landing pages, and short-form video.

Leadership rules take priority over general market logic unless there is strong real performance evidence.

Store priority rules:
1. K-Beauty priority stores
- All BF stores
- G02 Duluth
- G08 Douglasville
- G09 Columbus

2. GM priority stores
- G02 Duluth
- G04 Morrow
- G08 Douglasville
- G09 Columbus
- BF1
- BF3
- BF5

3. State-level direction
- Georgia: Hair Care and Hair Extensions remain the core.
- Florida: K-Beauty is a core business priority.

Category decision logic:
Before making any recommendation, determine:
1. Is this store a K-Beauty priority store?
2. Is this store a GM priority store?
3. Is it in Georgia or Florida?
4. Which category should be the hero for this campaign objective?

Rules:
- Do not give generic advice.
- Always connect data to action.
- Be clear, direct, and decisive.
- Prioritize visit-driving clarity, product relevance, and promotional communication over abstract brand language.
- If data is incomplete, use the most reliable provided signals and clearly state what data is missing.
- Do not hallucinate numbers.
- Do not use consumer-facing hype.
- Speak to internal operations and marketing teams.

Paid campaign rule:
For paid campaigns, recommend practical execution direction such as creative asset direction, hook ideas, audience interests, caption angles, and testing ideas when relevant.

Traffic-driving rule:
For traffic-driving campaigns, specify the clearest next action and what type of creative should launch first.

You must respond with ONLY a valid JSON object containing exactly these six fields:
{
  "query": "<the user request as a concise label, 3–6 words>",
  "keyInsight": "<1–2 sentences: the single most important finding from the store data for this request>",
  "whyItMatters": "<1–2 sentences: the business or operational consequence of this insight>",
  "recommendedAction": "<1–3 sentences: specific, concrete next steps; number them if more than one>",
  "dataUsed": "<comma-separated list of the specific data points cited in your response>",
  "confidence": <integer 0–100 reflecting how strongly the available data supports your recommendation>
}

Return raw JSON only. Do not include any text, explanation, or markdown outside the JSON object.`;
}

function buildUserMessage(promptKey: string, chipLabel: string, s: StoreContext, customText?: string): string {
  const done = s.merch.filter(([t]) => t === 'done').map(([, txt]) => txt);
  const pend = s.merch.filter(([t]) => t === 'pend').map(([, txt]) => txt);
  const merchSummary = [
    done.length > 0 ? `Completed: ${done.join(', ')}` : '',
    pend.length > 0 ? `Pending: ${pend.join(', ')}` : 'All merchandising items complete',
  ].filter(Boolean).join(' | ');

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
    return `${storeContext}

USER QUESTION
${customText}`;
  }

  const description = PROMPT_DESCRIPTIONS[promptKey] ?? PROMPT_DESCRIPTIONS['summarize'];
  return `${storeContext}

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
  let promptKey: string, chipLabel: string, customText: string, store: StoreContext;
  try {
    const body = await req.json();
    promptKey  = (body?.promptKey  ?? '').trim();
    chipLabel  = (body?.chipLabel  ?? '').trim();
    customText = (body?.customText ?? '').trim();
    store      = body?.store as StoreContext;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  if (!promptKey && !customText) return json({ error: 'promptKey or customText is required' }, 400, cors);
  if (!store?.name) return json({ error: 'store context is required' }, 400, cors);

  // 3. Get OpenAI key from Supabase secrets ─────────────────────────────────────
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('[ai-store-assistant] OPENAI_API_KEY secret is not set');
    return json({ error: 'AI service not configured' }, 500, cors);
  }

  // 4. Call OpenAI ──────────────────────────────────────────────────────────────
  let openaiRes: Response;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:           'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature:     0.4,
        max_tokens:      600,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user',   content: buildUserMessage(promptKey, chipLabel, store, customText || undefined) },
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

  const required = ['query', 'keyInsight', 'whyItMatters', 'recommendedAction', 'dataUsed', 'confidence'];
  for (const field of required) {
    if (structured[field] === undefined || structured[field] === null) {
      console.error('[ai-store-assistant] Missing field in response:', field, structured);
      return json({ error: `Incomplete AI response: missing ${field}` }, 500, cors);
    }
  }

  console.log(
    `[ai-store-assistant] OK store=${store.name} prompt=${promptKey}`,
    `tokens=${openaiData?.usage?.total_tokens ?? '?'}`,
  );
  return json(structured, 200, cors);
});
