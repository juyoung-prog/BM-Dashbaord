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

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origin      = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsHeaders);
  }

  // ── 1. Verify caller JWT ──────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ error: 'Missing authorization token' }, 401, corsHeaders);
  }
  const callerJwt = authHeader.slice(7).trim();
  if (!callerJwt) {
    return json({ error: 'Missing authorization token' }, 401, corsHeaders);
  }

  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { data: { user }, error: userErr } = await supabaseAnon.auth.getUser(callerJwt);
  if (userErr || !user) {
    console.error('[send-brevo-email] token verification failed:', userErr?.message ?? 'null user');
    return json({ error: 'Invalid or expired token' }, 401, corsHeaders);
  }

  // ── 2. Parse and validate request body ───────────────────────────────────
  let toEmail: string, toName: string, subject: string, htmlContent: string, textContent: string;
  try {
    const body     = await req.json();
    toEmail        = (body?.to_email      ?? '').trim();
    toName         = (body?.to_name       ?? '').trim();
    subject        = (body?.subject       ?? '').trim();
    htmlContent    = (body?.html_content  ?? '').trim();
    textContent    = (body?.text_content  ?? '').trim();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsHeaders);
  }

  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return json({ error: 'Valid recipient email is required' }, 400, corsHeaders);
  }
  if (!subject) {
    return json({ error: 'Subject is required' }, 400, corsHeaders);
  }
  if (!htmlContent) {
    return json({ error: 'Email content is required' }, 400, corsHeaders);
  }

  // ── 3. Read Brevo credentials from Supabase secrets ──────────────────────
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  const senderEmail = Deno.env.get('SENDER_EMAIL');
  const senderName  = Deno.env.get('SENDER_NAME') ?? 'BeautyMaster Ops';

  if (!brevoApiKey) {
    console.error('[send-brevo-email] BREVO_API_KEY secret is not set');
    return json({ error: 'Email service not configured' }, 500, corsHeaders);
  }
  if (!senderEmail) {
    console.error('[send-brevo-email] SENDER_EMAIL secret is not set');
    return json({ error: 'Email service not configured' }, 500, corsHeaders);
  }

  // ── 4. Call Brevo transactional email API ─────────────────────────────────
  const brevoPayload: Record<string, unknown> = {
    sender:      { name: senderName, email: senderEmail },
    to:          [{ email: toEmail, name: toName || toEmail }],
    subject,
    htmlContent,
  };
  if (textContent) brevoPayload.textContent = textContent;

  let brevoRes: Response;
  try {
    brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: {
        'api-key':      brevoApiKey,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });
  } catch (fetchErr) {
    console.error('[send-brevo-email] network error reaching Brevo:', fetchErr);
    return json({ error: 'Failed to reach email service' }, 502, corsHeaders);
  }

  if (!brevoRes.ok) {
    const errBody = await brevoRes.text();
    console.error('[send-brevo-email] Brevo API error:', brevoRes.status, errBody);
    return json({ error: 'Email send failed', detail: brevoRes.status }, 502, corsHeaders);
  }

  const brevoData = await brevoRes.json() as { messageId?: string };
  console.log('[send-brevo-email] sent to:', toEmail, 'messageId:', brevoData?.messageId);
  return json({ success: true, messageId: brevoData?.messageId ?? null }, 200, corsHeaders);
});
