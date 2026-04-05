import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  // ── 1. Extract JWT from Authorization header
  const authHeader = req.headers.get('Authorization') ?? '';

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return json({ error: 'Missing authorization token' }, 401, corsHeaders);
  }

  // Slice off exactly "Bearer " (7 chars) to get the raw token
  const callerJwt = authHeader.slice(7).trim();

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
    console.error('[invite-user] token verification failed:', callerErr?.message ?? 'user is null');
    return json({ error: 'Invalid or expired token' }, 401, corsHeaders);
  }

  // ── 2. Create service-role client (used for admin table lookups + invite)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── 3. Admin check — query public.admins table
  const { data: callerAdminRow, error: callerAdminErr } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', caller.email!)
    .maybeSingle();

  if (callerAdminErr) {
    console.error('[invite-user] admin lookup error:', callerAdminErr.message);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }
  if (!callerAdminRow) {
    return json({ error: 'Forbidden' }, 403, corsHeaders);
  }

  // ── 4. Parse and validate the target email from request body
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

  // Prevent inviting another admin by accident
  const { data: targetAdminRow } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', targetEmail)
    .maybeSingle();

  if (targetAdminRow) {
    return json({ error: 'Cannot invite an admin email' }, 400, corsHeaders);
  }

  // ── 5. Send invite using service role key (server-side only, never exposed to client)

  const redirectTo = Deno.env.get('INVITE_REDIRECT_URL') ?? 'https://juyoung-prog.github.io/BM-Dashbaord/login.html';

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(targetEmail, {
    redirectTo,
  });

  if (error) {
    console.error('[invite-user] inviteUserByEmail error:', error.message);
    return json({ error: '초대 전송에 실패했습니다.' }, 400, corsHeaders);
  }

  return json({ success: true, invited: targetEmail, user_id: data.user.id }, 200, corsHeaders);
});
