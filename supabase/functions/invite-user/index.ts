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

// How long an invite token is valid (must match Supabase dashboard setting)
const INVITE_TTL_HOURS = 24;

Deno.serve(async (req) => {
  const origin      = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsHeaders);
  }

  // ── 1. Extract and verify caller JWT ─────────────────────────────────────
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

  const { data: { user: caller }, error: callerErr } = await supabaseAnon.auth.getUser(callerJwt);
  if (callerErr || !caller) {
    console.error('[invite-user] token verification failed:', callerErr?.message ?? 'null user');
    return json({ error: 'Invalid or expired token' }, 401, corsHeaders);
  }

  // ── 2. Service-role client ────────────────────────────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── 3. Confirm caller is an admin ─────────────────────────────────────────
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

  // ── 4. Parse and validate target email ───────────────────────────────────
  let targetEmail: string;
  try {
    const body = await req.json();
    targetEmail = (body?.email ?? '').trim().toLowerCase();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsHeaders);
  }

  if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    return json({ error: 'Valid target email is required' }, 400, corsHeaders);
  }

  // Prevent inviting another admin
  const { data: targetAdminRow } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', targetEmail)
    .maybeSingle();

  if (targetAdminRow) {
    return json({ error: '관리자 이메일로는 초대할 수 없습니다.' }, 400, corsHeaders);
  }

  // ── 5. Check if target email is already a confirmed user ─────────────────
  // listUsers() is paginated; for a small-team dashboard this single-page
  // fetch is sufficient.
  const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error('[invite-user] listUsers error:', listErr.message);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }

  const alreadyRegistered = usersData.users.some(
    u => u.email === targetEmail && u.email_confirmed_at
  );
  if (alreadyRegistered) {
    return json({ error: '이미 가입된 이메일 주소입니다.' }, 400, corsHeaders);
  }

  // ── 6. Check for an existing valid (pending + non-expired) invitation ─────
  const { data: existingInvite, error: inviteCheckErr } = await supabaseAdmin
    .from('invitations')
    .select('id, expires_at')
    .eq('email', targetEmail)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (inviteCheckErr) {
    console.error('[invite-user] invite check error:', inviteCheckErr.message);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }
  if (existingInvite) {
    const expiresAt = new Date(existingInvite.expires_at);
    const hoursLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 3_600_000);
    return json(
      { error: `이미 유효한 초대가 전송되어 있습니다. ${hoursLeft}시간 후 만료됩니다.` },
      400,
      corsHeaders
    );
  }

  // Expire any stale pending invitations for this email before creating a new one
  await supabaseAdmin
    .from('invitations')
    .update({ status: 'expired' })
    .eq('email', targetEmail)
    .eq('status', 'pending');

  // ── 7. Record the invitation BEFORE calling inviteUserByEmail ─────────────
  // Inserting first ensures any DB-level triggers see the record in place.
  const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3_600_000).toISOString();

  const { data: newInvite, error: insertErr } = await supabaseAdmin
    .from('invitations')
    .insert({ email: targetEmail, invited_by: caller.email!, expires_at: expiresAt })
    .select('id')
    .single();

  if (insertErr || !newInvite) {
    console.error('[invite-user] insert invitation error:', insertErr?.message);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }

  // ── 8. Send the Supabase invite email ─────────────────────────────────────
  const redirectTo = Deno.env.get('INVITE_REDIRECT_URL')
    ?? 'https://juyoung-prog.github.io/BM-Dashbaord/login.html';

  const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    targetEmail,
    { redirectTo }
  );

  if (inviteErr) {
    // Roll back the invitation record so we don't leave an orphan
    await supabaseAdmin.from('invitations').delete().eq('id', newInvite.id);
    console.error('[invite-user] inviteUserByEmail error:', inviteErr.message);
    return json({ error: '초대 전송에 실패했습니다.' }, 400, corsHeaders);
  }

  return json({ success: true, invited: targetEmail }, 200, corsHeaders);
});
