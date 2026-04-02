import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Admin allowlist ────────────────────────────────────────────────────────
// Add your admin email(s) here. This is the only authorization gate.
// Alternatively, store this in an Edge Function secret (ADMIN_EMAILS=a@b.com,c@d.com)
// and parse with: Deno.env.get('ADMIN_EMAILS')!.split(',')
const ADMIN_EMAILS: string[] = [
  'your-admin@email.com', // ← replace with your actual admin email
];

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://juyoung-prog.github.io',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Verify JWT (Supabase validates this automatically when --no-verify-jwt is NOT used)
  //       Extract the caller's identity from the Authorization header.
  const authHeader = req.headers.get('Authorization') ?? '';
  const callerJwt  = authHeader.replace(/^Bearer\s+/i, '');

  if (!callerJwt) {
    return json({ error: 'Missing authorization token' }, 401);
  }

  // Use anon key to verify the caller's JWT and fetch their profile
  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${callerJwt}` } } }
  );

  const { data: { user: caller }, error: callerErr } = await supabaseAnon.auth.getUser();

  if (callerErr || !caller) {
    return json({ error: 'Invalid or expired token' }, 401);
  }

  // ── 2. Admin check — reject non-admin callers early
  if (!ADMIN_EMAILS.includes(caller.email!)) {
    return json({ error: 'Forbidden' }, 403);
  }

  // ── 3. Parse and validate the target email from request body
  let targetEmail: string;
  try {
    const body = await req.json();
    targetEmail = (body?.email ?? '').trim();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
    return json({ error: 'Valid target email is required' }, 400);
  }

  // Prevent inviting another admin by accident (optional, remove if not needed)
  if (ADMIN_EMAILS.includes(targetEmail)) {
    return json({ error: 'Cannot invite an admin email' }, 400);
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
    return json({ error: error.message }, 400);
  }

  return json({ success: true, invited: targetEmail, user_id: data.user.id });
});
