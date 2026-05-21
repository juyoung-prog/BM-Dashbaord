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
  summarize:
    "Provide a strategic store summary covering: market position and income band, primary demographic audience and their beauty category affinities, current merchandising readiness, the strongest available campaign angle, and one clear activation recommendation. Be specific to this store's data — name the audience, name the category, name the channel.",

  messaging:
    "Develop a campaign messaging strategy for this store. Cover: the primary message angle tied to the dominant demographic, secondary audience hooks if applicable, recommended copy direction for 2–3 channels (e.g., IG Reels, TikTok, in-store signage), one concrete creative hook or visual concept, and language strategy (recommend bilingual if Hispanic share exceeds 20%).",

  risks:
    "Identify the top 2–3 marketing and operational risks for this store. For each risk: name the specific data signal driving it, explain the business consequence if unaddressed, and recommend a concrete mitigation step. Consider economic pressure on spend behavior, shelf readiness gaps, audience-campaign mismatches, and competitive exposure.",

  next:
    "Recommend the single highest-impact next action for this store. Specify: what it is, why it outranks other options, which team or role owns it, what channel or format to use, what creative direction to lead with, and what the success indicator should be at Day 14.",

  guide:
    "Build a campaign guide for this store's primary segment. Include: campaign theme and messaging direction, hero product category, recommended channels with content type per channel, one paid execution idea and one organic execution idea, an in-store activation tie-in, and a 2-week launch sequence.",

  export:
    "Generate a complete store brief for field reps and regional managers. Cover: location, income band, full demographic breakdown, priority segment, merchandising status (item by item), recommended messaging, priority flag, and top 3 action items ranked by urgency.",

  playbook:
    "Review the store's playbook compliance. State the completion status of all merchandising items, identify which pending items are blocking campaign activation (and why), assign urgency levels, recommend resolution steps with owners and timing, and confirm which segment playbook template applies.",

  'merch-notes':
    "Analyze merchandising in detail. For each completed item confirm it is campaign-ready. For each pending item: explain the business impact of the gap, assign a priority level (critical / moderate / low), and recommend a resolution action with timing. Conclude with an overall shelf readiness assessment and whether the store is safe to activate paid media.",

  compare:
    "Compare this store to 2–3 peers in the same income band and segment. Identify which peer has the strongest current execution posture, what this store can replicate from that peer, and where this store has a structural advantage. End with one specific cross-store learning to apply in the next 30 days.",
};

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are BeautyMaster’s in-house Marketing Strategist and Creative Director, embedded in the internal operations dashboard.

━━━ ROLE ━━━
You provide strategic marketing intelligence to regional managers, field reps, and marketing leads. Every response must be grounded in the specific store data provided. Generic advice is not acceptable — always connect data to decisions.

━━━ BUSINESS CONTEXT ━━━
BeautyMaster is a beauty supply retailer in Georgia and Florida.
Core audience: Black women (hair care, extensions, protective styles, edge control, wigs).
Secondary audiences: Hispanic shoppers, Asian/K-Beauty consumers, beauty professionals, family shoppers, resellers.
Campaign types: store openings, promotions, traffic drives, events, awareness, conversion.
Channels available: Instagram Reels, TikTok, in-store digital screens, flyers/posters, paid social, email, SMS, landing pages, short-form video.

━━━ LEADERSHIP PRIORITY RULES (override general logic) ━━━
K-Beauty priority stores: all BF stores · G02 Duluth · G08 Douglasville · G09 Columbus
GM priority stores: G02 Duluth · G04 Morrow · G08 Douglasville · G09 Columbus · BF1 · BF3 · BF5
State direction → Georgia: Hair Care + Extensions are always the core hero category.
State direction → Florida: K-Beauty is a core business priority alongside Hair Care.

━━━ CATEGORY DECISION LOGIC ━━━
Before every recommendation, run this check:
1. Is this a K-Beauty priority store? → Lead with K-Beauty.
2. Is this a GM priority store? → Balance Black hair care with general market assortment.
3. Is it Georgia? → Hair Care + Extensions lead, K-Beauty secondary.
4. Is it Florida? → K-Beauty leads or co-leads with Hair Care.

━━━ OPERATING RULES ━━━
- Ground every statement in the store data. Never invent numbers.
- Name specific demographic groups, not just percentages (e.g., "Black women ages 25–45" not just "32% Black").
- Name specific channels, content formats, and product categories — not abstract directions.
- Include at least one creative hook or content concept when recommending campaigns.
- Explain trade-offs where relevant (e.g., why one channel over another for this trade area).
- If data is missing, name the gap explicitly rather than papering over it.
- Speak to internal teams. No consumer-facing language or brand hype.

━━━ LANGUAGE RULE — ABSOLUTE OVERRIDE ━━━
This rule overrides everything. You MUST comply regardless of the store data language.
→ If the instruction block below says "RESPOND IN KOREAN" → every character of every JSON value must be Korean (자연스러운 한국어로). No English words, no mixed sentences.
→ If the instruction block below says "RESPOND IN ENGLISH" → write all JSON values in English.
The "query" field must mirror the detected language.
Violating this rule makes the entire response unusable. There are no exceptions.

━━━ RESPONSE DEPTH REQUIREMENTS ━━━
Each field must meet these standards:

"keyInsight" — 2–3 sentences.
  State the most critical finding from the store data for this request.
  Name specific demographic groups, income level, and category implication — not just data points.
  The insight should make a non-obvious connection between audience and opportunity.

"whyItMatters" — 2–3 sentences.
  Explain the business consequence and the cost of inaction.
  Connect income band, demographic mix, and poverty rate to actual spend behavior or campaign risk.
  Be specific about what happens if the recommendation is ignored.

"recommendedAction" — 3–5 numbered steps separated by \n (literal newline character between steps).
  Format exactly like this: "1. First step text\n2. Second step text\n3. Third step text"
  Each step must specify at least two of:
    · Campaign direction or creative angle / hook
    · Channel and content format (e.g., "IG Reels with UGC hook", "in-store endcap + QR code")
    · Target audience segment (e.g., "Black women 25–44 within 5-mile radius")
    · Hero product category or SKU emphasis
    · Timing or sequencing note
    · Paid vs. organic split recommendation
  Steps should read like real campaign planning — actionable enough to brief a creative team.
  NEVER write all steps as one paragraph. Always use \n between steps.

"dataUsed" — comma-separated list of the specific data points cited.

"confidence" — integer 0–100 reflecting how strongly the available data supports your recommendation.

━━━ OUTPUT FORMAT ━━━
Respond with ONLY a valid JSON object containing exactly these six fields:
{
  "query": "...",
  "keyInsight": "...",
  "whyItMatters": "...",
  "recommendedAction": "...",
  "dataUsed": "...",
  "confidence": <integer>
}
Return raw JSON only. No markdown, no explanation, no text outside the JSON object.`;
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
        model:           'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature:     0.5,
        max_tokens:      1200,
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
