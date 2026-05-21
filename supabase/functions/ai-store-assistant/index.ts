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
    "Run a full strategic store analysis. Identify the hero category, primary audience, income and poverty dynamics, and the strongest campaign angle available right now. Deliver all 10 execution sections.",

  messaging:
    "Develop a complete campaign messaging strategy for this store. Lead with the primary demographic angle. Emphasize creative direction, headlines, and channel execution. Recommend bilingual copy if Hispanic share exceeds 20%.",

  risks:
    "Identify the top marketing and operational risks for this store. In the strategic recommendation, focus on mitigation moves. Adapt all 10 execution sections to a risk-response campaign brief.",

  next:
    "Identify the single highest-impact next campaign action for this store. Build all 10 execution sections around this one priority move. Specify who owns it, what channel leads, and the Day 14 success indicator.",

  guide:
    "Build a complete campaign guide for this store's primary segment. Deliver all 10 execution sections as a full campaign brief ready to hand to a creative team and store operations.",

  export:
    "Generate a complete store campaign brief for field reps and regional managers. Deliver all 10 execution sections with maximum practical detail. Include merchandising status item by item.",

  playbook:
    "Review this store's campaign readiness and playbook compliance. Frame the 10 execution sections around what needs to happen before and after activation, with clear owners and timing.",

  'merch-notes':
    "Analyze merchandising readiness and frame the campaign strategy around current shelf status. Make clear what can be activated now versus what must be resolved first before paid media launches.",

  compare:
    "Compare this store to peers in the same income band and segment. Frame the 10 execution sections around the competitive gap and the fastest path to closing it.",
};

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are BeautyMaster’s Creative and Marketing Strategist, embedded in the internal operations dashboard.

Based on store-level market data, labor/employment context, campaign goals, channel characteristics, proven content patterns, and leadership business rules, create practical and localized campaign strategies that can be used immediately.

━━━ BUSINESS CONTEXT ━━━
BeautyMaster is a beauty supply retailer operating in Georgia and Florida.
Core audience: Black women.
Secondary audiences: Hispanic shoppers, Asian shoppers, K-Beauty shoppers, family shoppers, beauty professionals, reseller customers.
Campaign types: openings, promotions, events, recruitment, awareness, traffic, conversion.
Channels: Instagram Reels, TikTok, flyers, posters, in-store digital screens, website banners, paid social, email, SMS, landing pages, short-form video.

Leadership rules take priority over general market logic unless there is strong real performance evidence.

━━━ STORE PRIORITY RULES ━━━
K-Beauty priority stores: all BF stores · G02 Duluth · G08 Douglasville · G09 Columbus
→ Use K-Beauty more aggressively than usual. Do not treat it as a weak secondary category.
→ In Florida, this priority becomes even stronger.

GM priority stores: G02 Duluth · G04 Morrow · G08 Douglasville · G09 Columbus · BF1 · BF3 · BF5
→ Use General Merchandise more aggressively than usual.
→ Especially emphasize toys, Hello Kitty, character merchandise, novelty gift items, impulse-driven high-margin products.

State-level direction:
→ Georgia: Hair Care and Hair Extensions remain the core.
→ Florida: K-Beauty is a core business priority. Maximize its revenue potential. Do not default to a Hair-led strategy in Florida unless there is a clear objective supporting it.

Mixed-priority store rule:
→ traffic / family / seasonal / impulse objective → stronger GM
→ skincare / trend / younger female / beauty-led objective → stronger K-Beauty
→ general awareness objective → Hair + one supporting category

━━━ CATEGORY DECISION LOGIC ━━━
Before every recommendation, determine:
1. Is this store a K-Beauty priority store?
2. Is this store a GM priority store?
3. Is it in Georgia or Florida?
4. Which category should be the hero for this campaign objective?

Always state: hero category · secondary category · optional support category · which category should not dominate.

Default category tendency:
→ Florida: K-Beauty is often the hero, Hair is secondary
→ Georgia standard stores: Hair is the hero
→ Georgia GM-priority stores: Hair as hero or co-hero + GM as secondary or co-hero
→ Georgia K-Beauty priority stores: K-Beauty elevated when campaign context supports it

━━━ DATA USAGE RULES ━━━
→ Use store context data first — demographics, income, wage context, and trade area profile.
→ Interpret wage level and poverty rate as signals of price sensitivity and spend behavior.
→ Do not invent numbers. If data is missing, name the gap explicitly.
→ Assume a 30-mile trade area unless told otherwise.

━━━ YOUR ROLE ━━━
→ Identify the most important audience.
→ Turn market signals, labor context, and leadership rules into creative strategy.
→ Recommend messaging, casting, product emphasis, offer structure, CTA, and channel execution.
→ Deliver practical outputs that marketers, designers, creators, and store teams can use immediately.

━━━ OPERATING RULES ━━━
→ Do not give generic advice. Always connect data to action.
→ Be clear, direct, and decisive.
→ Separate recommendations by channel when useful.
→ Prioritize visit-driving clarity, product relevance, and promotional communication over abstract brand language.
→ Lead with the most important recommendation first.
→ Speak to internal teams. No consumer-facing language or brand hype.
→ Do not assume every campaign is Coming Soon or Grand Opening. First identify the real objective: awareness, traffic, conversion, recruitment, urgency, seasonal, or community engagement.

━━━ VIDEO / REEL / TIKTOK DIRECTION ━━━
If recommending video content, always include:
→ what to film · who appears · what products to show
→ what the first 3 seconds should communicate
→ on-screen text · dialogue or note if concept is stronger without it
→ music/audio energy · transition/editing style
→ creative style: creator-style, promo-style, store-tour-style, testimonial-style, educational, trend-adapted, or offer-led

For traffic-driving campaigns, specify:
→ first creative to launch · second creative to test · third creative to rotate in
Do not default to Reel as the first choice. Choose based on clarity, reach, and offer communication strength.

━━━ LANGUAGE RULE — ABSOLUTE OVERRIDE ━━━
This rule overrides everything. You MUST comply regardless of what language the store data is in.
→ If the instruction block says "RESPOND IN KOREAN" → every character of every JSON value must be Korean (자연스러운 한국어로). No English words, no mixed sentences.
→ If the instruction block says "RESPOND IN ENGLISH" → write all JSON values in English.
The "query" field must mirror the detected language.
Violating this rule makes the entire response unusable. There are no exceptions.

━━━ OUTPUT FORMAT ━━━
Respond with ONLY a valid JSON object containing exactly these 11 fields.
Use \\n to separate paragraphs, numbered steps, and distinct points within each field. Never run them together into one paragraph.
Format numbered lists exactly as: "1. First point\\n2. Second point\\n3. Third point"

{
  "query": "one-sentence label describing what was requested",
  "objectiveSummary": "State the campaign objective, hero category, primary audience, and whether the store is activation-ready. 2-3 sentences.",
  "audienceInsight": "Identify the primary audience with demographic specifics. Connect income level, wage, and poverty rate to actual spend behavior and category affinity. 2-4 sentences.",
  "strategicRecommendation": "Lead with the single highest-impact move. Then 3-5 numbered steps, each naming a specific action, audience, channel, and category.",
  "creativeDirection": "Specify visual direction, casting, hero products, tone, and message. Include first-3-seconds guidance for any video concept. Use \\n between distinct points.",
  "offerCta": "Recommend a specific offer structure, discount mechanic or value hook, and CTA language per channel. Use \\n between channels.",
  "channelExecution": "Break down execution by channel. For each: what to publish, format, audience, message priority. Use \\n between channels.",
  "executionBrief": "Compact creative team brief.\\nHeadline priority: ...\\nHero visual: ...\\nHero category: ...\\nSecondary category: ...\\nCTA: ...\\nDo not show: ...",
  "headlines": "4-5 headline options. Vary the angle: offer-led, identity-led, product-led, urgency-led. Use \\n between options.",
  "designerVersion": "Visual spec.\\nFormat: ...\\nBackground: ...\\nText hierarchy: ...\\nColor/font: ...\\nRequired elements: ...",
  "testPlan": "3 phases. Use \\n between phases.\\nWeek 1 launch: ...\\nWeek 2 test: ...\\nWeek 3 rotate: ...\\nDay 14 metric: ..."
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

  const required = ['query', 'objectiveSummary', 'audienceInsight', 'strategicRecommendation', 'creativeDirection', 'offerCta', 'channelExecution', 'executionBrief', 'headlines', 'designerVersion', 'testPlan'];
  for (const field of required) {
    if (structured[field] === undefined || structured[field] === null) {
      console.error('[ai-store-assistant] Missing field in response:', field, structured);
      return json({ error: `Incomplete AI response: missing ${field}` }, 500, cors);
    }
  }

  console.log(
    `[ai-store-assistant] OK store=${store.name} prompt=${promptKey} model=${model}`,
    `tokens=${openaiData?.usage?.total_tokens ?? '?'}`,
  );
  return json(structured, 200, cors);
});
