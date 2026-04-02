import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Admin allowlist ────────────────────────────────────────────────────────
const ADMIN_EMAILS: string[] = [
  'juyoung@beautymaster.com',
];

// ─── CORS ────────────────────────────────────────────────────────────────────
// List every origin that is allowed to call this function.
// Add localhost variants here so local dev works without redeploying.
const ALLOWED_ORIGINS = [
  'https://juyoung-prog.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Reflect the request origin back if it is in the allowlist;
  // otherwise fall back to the production origin (safe default).
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

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsHeaders);
  }

  // ── 1. Verify JWT — extract the caller's identity from the Authorization header
  const authHeader = req.headers.get('Authorization') ?? '';
  const callerJwt  = authHeader.replace(/^Bearer\s+/i, '');

  if (!callerJwt) {
    return json({ error: 'Missing authorization token' }, 401, corsHeaders);
  }

  // Verify the caller's JWT by passing it explicitly to getUser().
  // auth.getUser(token) calls /auth/v1/user with the token — correct for server-side use.
  // auth.getUser() without args looks for a browser session that doesn't exist in Deno.
  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const { data: { user: caller }, error: callerErr } = await supabaseAnon.auth.getUser(callerJwt);

  if (callerErr || !caller) {
    const reason = callerErr?.message ?? 'user is null';
    return json({ error: 'Invalid or expired token', detail: reason }, 401, corsHeaders);
  }

  // ── 2. Admin check — reject non-admin callers early
  if (!ADMIN_EMAILS.includes(caller.email!)) {
    return json({ error: 'Forbidden' }, 403, corsHeaders);
  }

  // ── 3. Parse and validate the target email from request body
  let targetEmail: string;
  try {
    const body = await req.json();
    targetEmail = (body?.email ?? '').trim();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsHeaders);
  }

  if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    return json({ error: 'Valid target email is required' }, 400, corsHeaders);
  }

  // Prevent inviting another admin by accident (optional, remove if not needed)
  if (ADMIN_EMAILS.includes(targetEmail)) {
    return json({ error: 'Cannot invite an admin email' }, 400, corsHeaders);
  }

  // ── 4. Send invite using service role key (server-side only, never exposed to client)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(targetEmail, {
    redirectTo: 'https://juyoung-prog.github.io/BM-Dashbaord/login.html',
  });

  if (error) {
    return json({ error: error.message }, 400, corsHeaders);
  }

  return json({ success: true, invited: targetEmail, user_id: data.user.id }, 200, corsHeaders);
});
