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

// Called by the client immediately after the user successfully sets their
// password during the invite acceptance flow.  This marks the invitation as
// used so the token cannot be reused even if the Supabase magic-link somehow
// survived (e.g. a future token-reuse vulnerability).
Deno.serve(async (req) => {
  const origin      = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsHeaders);
  }

  // ── 1. Verify the caller's JWT ────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ error: 'Missing authorization token' }, 401, corsHeaders);
  }
  const callerJwt = authHeader.slice(7).trim();

  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { data: { user }, error: userErr } = await supabaseAnon.auth.getUser(callerJwt);
  if (userErr || !user?.email) {
    console.error('[accept-invite] token verification failed:', userErr?.message ?? 'null user');
    return json({ error: 'Invalid or expired token' }, 401, corsHeaders);
  }

  // ── 2. Service-role client ────────────────────────────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── 3. Find a matching pending, non-expired invitation ────────────────────
  const { data: invite, error: findErr } = await supabaseAdmin
    .from('invitations')
    .select('id, expires_at')
    .eq('email', user.email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) {
    console.error('[accept-invite] invitation lookup error:', findErr.message);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }

  if (!invite) {
    // No valid invitation — reject and signal the client to sign out
    console.warn('[accept-invite] no valid invitation for:', user.email);
    return json({ error: '유효한 초대가 존재하지 않습니다. 관리자에게 문의하세요.' }, 403, corsHeaders);
  }

  // ── 4. Immediately invalidate the invitation (one-time use) ───────────────
  const { error: updateErr } = await supabaseAdmin
    .from('invitations')
    .update({ status: 'used', used_at: new Date().toISOString() })
    .eq('id', invite.id);

  if (updateErr) {
    console.error('[accept-invite] invitation invalidation error:', updateErr.message);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }

  console.log('[accept-invite] invitation consumed for:', user.email);
  return json({ success: true }, 200, corsHeaders);
});
